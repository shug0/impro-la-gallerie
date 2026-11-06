import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Artwork } from "../../services/metMuseumApi";

export interface ArtworkDisplayProps {
  currentArtwork: Artwork;
  nextArtwork: Artwork | null;
  onImageLoad?: (ratio: "landscape" | "portrait") => void;
  onNextImagePreloaded?: () => void;
  className?: string;
}

/**
 * Component pour afficher les œuvres d'art avec crossfade élégant
 * - Transitions fluides avec AnimatePresence
 * - Fond noir garanti (pas de flash blanc)
 * - Image suivante préchargée dans le DOM
 * - Détection automatique du ratio (landscape/portrait)
 */
export const ArtworkDisplay = ({
  currentArtwork,
  nextArtwork,
  onImageLoad,
  onNextImagePreloaded,
  className = "",
}: ArtworkDisplayProps) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [shownIds, setShownIds] = useState({
    current: currentArtwork.objectID,
    next: nextArtwork?.objectID,
  });

  // Marque l'œuvre courante et la suivante comme chargées quand l'une change (déjà préchargées)
  if (
    shownIds.current !== currentArtwork.objectID ||
    shownIds.next !== nextArtwork?.objectID
  ) {
    setShownIds({
      current: currentArtwork.objectID,
      next: nextArtwork?.objectID,
    });
    setLoadedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentArtwork.objectID);
      if (nextArtwork) newSet.add(nextArtwork.objectID);
      return newSet;
    });
  }

  /**
   * Détecte le ratio de l'image et appelle le callback
   */
  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement>,
    artworkId: number,
  ) => {
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    const imageRatio = ratio > 1 ? "landscape" : "portrait";

    setLoadedImages((prev) => new Set(prev).add(artworkId));

    // Only call callback for current artwork
    if (artworkId === currentArtwork.objectID) {
      onImageLoad?.(imageRatio);
    }
  };

  /**
   * Callback quand l'image suivante est préchargée
   */
  const handleNextImageLoad = () => {
    onNextImagePreloaded?.();
  };

  const isCurrentLoaded = loadedImages.has(currentArtwork.objectID);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center p-8 bg-black ${className}`}
    >
      {/* Crossfade entre les images avec AnimatePresence */}
      {/* Sans mode="wait" pour permettre la superposition des images pendant la transition */}
      <AnimatePresence initial={false}>
        <motion.img
          key={currentArtwork.objectID}
          src={currentArtwork.primaryImage}
          alt={currentArtwork.title}
          className="absolute max-w-full max-h-full object-contain"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          onLoad={(e) => handleImageLoad(e, currentArtwork.objectID)}
          initial={{ opacity: 0 }}
          animate={{ opacity: isCurrentLoaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0.0, 0.2, 1], // easeOut custom pour transition douce
          }}
        />
      </AnimatePresence>

      {/* Spinner de chargement (visible uniquement si image pas encore chargée) */}
      {!isCurrentLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-gray-700 border-t-gray-500 rounded-full"
          />
        </div>
      )}

      {/* Image suivante (préchargée, cachée) */}
      {nextArtwork && (
        <img
          src={nextArtwork.primaryImage}
          alt={nextArtwork.title}
          className="absolute pointer-events-none"
          style={{
            opacity: 0,
            visibility: "hidden",
            position: "absolute",
            top: -9999,
            left: -9999,
          }}
          onLoad={handleNextImageLoad}
        />
      )}
    </div>
  );
};
