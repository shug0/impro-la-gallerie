import { useCallback, useState } from "react";
import { type Artwork, metMuseumService } from "../services/metMuseumApi";

export interface UseArtworkGalleryResult {
  currentArtwork: Artwork | null;
  nextArtwork: Artwork | null;
  isLoadingArtwork: boolean;
  error: string | null;
  loadInitialArtwork: () => Promise<void>;
  goToNextArtwork: () => void;
}

/**
 * Hook pour gérer l'affichage et le préchargement des œuvres d'art
 * - Gère l'œuvre courante et la suivante (double buffer)
 * - Précharge automatiquement l'image suivante
 * - Navigation fluide sans loading visible
 */
export const useArtworkGallery = (): UseArtworkGalleryResult => {
  const [currentArtwork, setCurrentArtwork] = useState<Artwork | null>(null);
  const [nextArtwork, setNextArtwork] = useState<Artwork | null>(null);
  const [isLoadingArtwork, setIsLoadingArtwork] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Précharge une image en créant un objet Image en mémoire
   * Le navigateur la met en cache HTTP automatiquement
   */
  const preloadImage = useCallback((url: string): Promise<void> => {
    const filename = url.substring(url.lastIndexOf("/") + 1);
    console.log(`⏳ Preloading: ${filename}`);

    return new Promise((resolve, reject) => {
      const img = new Image();

      // Timeout augmenté à 30 secondes pour connexions lentes
      const timeout = setTimeout(() => {
        console.warn(`⏱️ Timeout (30s): ${filename}`);
        reject(new Error("Image load timeout after 30 seconds"));
      }, 30000);

      img.onload = () => {
        clearTimeout(timeout);
        console.log(`✅ Loaded: ${filename}`);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeout);
        console.warn(`❌ Failed: ${filename}`);
        reject(new Error("Image load failed"));
      };

      img.src = url;
    });
  }, []);

  /**
   * Récupère une nouvelle œuvre depuis le service Met Museum
   * Réessaie au plus `maxRetries` fois si l'œuvre reçue n'a pas d'image
   */
  const fetchNewArtwork = useCallback(
    async (maxRetries = 5): Promise<Artwork | null> => {
      try {
        for (let retriesLeft = maxRetries; ; retriesLeft--) {
          const artwork = await metMuseumService.getRandomArtwork();

          if (artwork?.primaryImage) {
            console.log(`📦 Fetched #${artwork.objectID}: "${artwork.title}"`);
            return artwork;
          }

          if (retriesLeft <= 0) {
            console.error("❌ Max retries reached");
            return null;
          }
        }
      } catch (err) {
        console.error("Failed to fetch artwork:", err);
        setError(err instanceof Error ? err.message : "Failed to load artwork");
        return null;
      }
    },
    [],
  );

  /**
   * Charge la première œuvre au montage (appelé depuis App.tsx)
   * Avec auto-skip si l'image ne charge pas
   */
  const loadInitialArtwork = useCallback(async () => {
    if (currentArtwork) return; // Déjà chargé

    console.log("🎨 Loading initial artwork...");
    setIsLoadingArtwork(true);
    setError(null);

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        // Récupérer une œuvre
        const artwork = await fetchNewArtwork();

        if (!artwork) {
          attempts++;
          continue;
        }

        // Essayer de précharger l'image
        try {
          await preloadImage(artwork.primaryImage);

          // Succès ! Définir comme artwork courant
          setCurrentArtwork(artwork);
          setError(null); // Une erreur d'un essai précédent masquerait l'œuvre chargée
          console.log("✅ Initial artwork ready");

          // Immédiatement précharger la suivante
          const next = await fetchNewArtwork();
          if (next) {
            setNextArtwork(next);
            // Précharger l'image suivante en arrière-plan (non bloquant)
            preloadImage(next.primaryImage).catch(() => {});
          }

          // Succès complet, sortir de la boucle
          break;
        } catch {
          // Image failed to load, try next artwork
          attempts++;
          console.log(`🔄 Auto-skip (${attempts}/${maxAttempts})`);
        }
      } catch {
        attempts++;
      }
    }

    if (!currentArtwork && attempts >= maxAttempts) {
      setError(
        "Unable to load any artwork after multiple attempts. Please check your connection.",
      );
    }

    setIsLoadingArtwork(false);
  }, [currentArtwork, fetchNewArtwork, preloadImage]);

  /**
   * Passe à l'œuvre suivante (déjà préchargée)
   * Avec gestion d'erreur et auto-skip si nécessaire
   */
  const goToNextArtwork = useCallback(async () => {
    if (!nextArtwork) {
      console.log("⏭️ No next, fetching...");

      // Try to fetch and load a new artwork directly
      const newArtwork = await fetchNewArtwork();
      if (newArtwork) {
        try {
          await preloadImage(newArtwork.primaryImage);
          setCurrentArtwork(newArtwork);
          setError(null);

          // Preload N+1
          const next = await fetchNewArtwork();
          if (next) {
            setNextArtwork(next);
            preloadImage(next.primaryImage).catch(() => {});
          }
        } catch {
          setError("Unable to load next artwork");
        }
      }
      return;
    }

    // Transition instantanée : l'image est déjà préchargée
    console.log(`⏭️ Next: #${nextArtwork.objectID}`);
    setCurrentArtwork(nextArtwork);
    setError(null); // Clear any previous errors

    // Précharger l'œuvre N+2 en arrière-plan
    try {
      const newNext = await fetchNewArtwork();
      if (newNext) {
        setNextArtwork(newNext);
        // Précharger l'image N+2 (non bloquant, avec retry sur échec)
        preloadImage(newNext.primaryImage).catch(async () => {
          // If preload fails, try another artwork
          const retryArtwork = await fetchNewArtwork();
          if (retryArtwork) {
            setNextArtwork(retryArtwork);
            preloadImage(retryArtwork.primaryImage).catch(() => {});
          }
        });
      }
    } catch {
      // Not critical, user can still navigate
    }
  }, [nextArtwork, fetchNewArtwork, preloadImage]);

  return {
    currentArtwork,
    nextArtwork,
    isLoadingArtwork,
    error,
    loadInitialArtwork,
    goToNextArtwork,
  };
};
