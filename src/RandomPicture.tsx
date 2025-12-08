import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { metMuseumService, type Artwork } from "./services/metMuseumApi";
import { ProgressiveImage } from "./components/artwork/ProgressiveImage";

export default function RandomPicture() {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchRandomArtwork = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const randomArtwork = await metMuseumService.getRandomArtwork();
      if (randomArtwork) {
        setArtwork(randomArtwork);
        setRetryCount(0);
      } else {
        setError("Aucune œuvre trouvée");
      }
    } catch (err) {
      setError("Erreur lors du chargement de l'œuvre");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomArtwork();
  }, [fetchRandomArtwork]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchRandomArtwork();
  }, [fetchRandomArtwork]);

  const handleImageError = useCallback(() => {
    setError("Erreur de chargement de l'image");
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center">
        {/* Enhanced loading skeleton */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-80 h-96 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-lg mb-6 relative overflow-hidden"
          >
            <motion.div
              animate={{ x: [-320, 320] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 left-0 w-80 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-center"
          >
            <div className="h-6 bg-gray-700 rounded w-60 mb-3 mx-auto"></div>
            <div className="h-4 bg-gray-700 rounded w-40 mx-auto"></div>
          </motion.div>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl"
        >
          Chargement d'une œuvre...
        </motion.p>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-xl text-red-400 mb-4">
            {error || "Aucune œuvre disponible"}
          </p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-400 mb-4">
              Tentative {retryCount}/3
            </p>
          )}
          <button
            onClick={handleRetry}
            disabled={retryCount >= 3}
            className="text-lg border border-white px-4 py-2 rounded hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {retryCount >= 3 ? "Limite atteinte" : "Réessayer"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-h-full w-full">
      <div className="max-h-[80vh] w-auto mb-4">
        <ProgressiveImage
          src={artwork.primaryImage}
          lowResSrc={artwork.lowResImage}
          alt={artwork.title}
          className="max-h-[80vh] w-auto"
          onError={handleImageError}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center max-w-2xl px-4"
      >
        <h3 className="text-2xl font-display mb-2">{artwork.title}</h3>
        <p className="text-lg mb-1">
          {artwork.artistDisplayName} • {artwork.objectDate}
        </p>
        <p className="text-sm opacity-75">
          {artwork.medium} • {artwork.department}
        </p>
      </motion.div>
    </div>
  );
}
