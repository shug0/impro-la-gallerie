import { motion, AnimatePresence } from "framer-motion";
import type { Artwork } from "../../services/metMuseumApi";

export interface WaitingScreenProps {
  quote: {
    text: string;
    author: string;
  };
  artworksCount: number;
  currentArtwork: Artwork | null;
}

/**
 * Écran de présentation/attente
 * - Grand titre "La galerie"
 * - Citations rotatives toutes les 15 secondes
 * - Nombre d'œuvres disponibles
 * - Préchargement de la première œuvre (cachée dans le DOM)
 */
export const WaitingScreen = ({
  quote,
  artworksCount,
  currentArtwork,
}: WaitingScreenProps) => {
  return (
    <motion.div
      key="waiting"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-black flex flex-col items-center justify-center"
    >
      {/* Grand titre */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="font-display text-8xl md:text-9xl text-warm-white mb-16 tracking-wide"
      >
        La galerie
      </motion.h1>

      {/* Citation avec rotation toutes les 15 secondes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quote.text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-8 text-center mb-16"
        >
          <p className="text-gallery-gray text-4xl italic mb-8 font-display leading-relaxed">
            "{quote.text}"
          </p>
          <p className="text-gallery-muted text-2xl tracking-wide">
            — {quote.author}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Nombre d'œuvres disponibles */}
      {artworksCount > 0 && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-gray-400 text-xl italic"
        >
          {artworksCount.toLocaleString('fr-FR')} œuvres disponibles
        </motion.p>
      )}

      {/* Image préchargée cachée dans le DOM */}
      {currentArtwork && (
        <img
          src={currentArtwork.primaryImage}
          alt="preload"
          className="absolute pointer-events-none"
          style={{
            opacity: 0,
            visibility: 'hidden',
            position: 'absolute',
            top: -9999,
            left: -9999,
          }}
        />
      )}
    </motion.div>
  );
};
