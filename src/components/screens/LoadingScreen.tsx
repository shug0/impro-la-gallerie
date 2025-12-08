import { motion, AnimatePresence } from "framer-motion";

export interface LoadingScreenProps {
  quote: {
    text: string;
    author: string;
  };
}

/**
 * Écran de chargement avec citations rotatives
 * - Spinner animé
 * - Citations d'artistes qui changent toutes les 5 secondes
 * - Affiché pendant le chargement des œuvres
 */
export const LoadingScreen = ({ quote }: LoadingScreenProps) => {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 bg-black flex flex-col items-center justify-center"
    >
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-2 border-gallery-gray border-t-transparent rounded-full mb-16"
      />

      {/* Citation d'artiste avec animation de transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quote.text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-8 text-center"
        >
          <p className="text-gallery-gray text-3xl italic mb-6 font-display leading-relaxed">
            "{quote.text}"
          </p>
          <p className="text-gallery-muted text-lg tracking-wide">
            — {quote.author}
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
