import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { metMuseumService, type GalleryMode } from "../services/metMuseumApi";

export interface UseMetMuseumState {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  artworksCount: number;
  cachedCount: number;
}

/**
 * Hook pour gérer l'initialisation et l'état du service Met Museum
 * - Utilise React Query pour gérer le cache et les refetch
 * - Lazy loading: initialise le service UNIQUEMENT quand initialize() est appelée
 * - Précharge les premières œuvres
 * - Expose l'état de chargement et les statistiques
 */
export const useMetMuseum = () => {
  const [mode, setMode] = useState<GalleryMode | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['metMuseum', mode],
    queryFn: async () => {
      if (!mode) return null; // Skip if no mode selected yet

      // Configurer le mode avant l'initialisation
      metMuseumService.setMode(mode);

      // Étape 1: Initialiser le service (charger la liste des IDs)
      await metMuseumService.initialize();

      // Étape 2: Précharger quelques œuvres pour un affichage instantané
      await metMuseumService.preloadInitialArtworks(3);

      // Retourner les statistiques
      return {
        artworksCount: metMuseumService.availableArtworksCount,
        cachedCount: metMuseumService.cachedArtworksCount,
      };
    },
    enabled: mode !== null, // Only run query when mode is set
    staleTime: Infinity, // Les données ne deviennent jamais stale (on change via le mode)
    gcTime: Infinity, // Garder en cache indéfiniment
  });

  const initialize = (selectedMode: GalleryMode) => {
    setMode(selectedMode); // This triggers the query
  };

  return {
    isLoading,
    isReady: !isLoading && !error && !!data,
    error: error ? (error instanceof Error ? error.message : "Erreur de chargement") : null,
    artworksCount: data?.artworksCount ?? 0,
    cachedCount: data?.cachedCount ?? 0,
    initialize, // Expose manual initialization function
    retry: () => refetch(),
  };
};
