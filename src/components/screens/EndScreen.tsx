import { motion } from "framer-motion";
import { Button } from "../ui/Button";

export interface EndScreenProps {
  onClose?: () => void;
  className?: string;
}

/**
 * Écran de fin élégant affiché avec le raccourci "E"
 * - Message de remerciement
 * - Design minimaliste aligné avec le reste de l'app
 * - Animation douce
 */
export const EndScreen = ({ onClose, className = "" }: EndScreenProps) => {
  return (
    <motion.div
      className={`absolute inset-0 bg-black flex flex-col items-center justify-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Message principal */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="font-display text-7xl md:text-9xl text-warm-white mb-12 tracking-wide text-center px-8"
      >
        Merci
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-gray-400 text-2xl md:text-3xl text-center max-w-3xl px-8 mb-16 leading-relaxed"
      >
        d'avoir visité notre galerie
      </motion.p>

      {/* Sous-titre élégant */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="text-gray-600 text-base md:text-lg italic text-center max-w-2xl px-8 mb-16"
      >
        Nous espérons que cette collection vous a inspiré
      </motion.p>

      {/* Instructions de retour */}
      {onClose && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col items-center gap-6"
        >
          <Button onClick={onClose} size="lg" enableMotion={false}>
            Revenir à la galerie
          </Button>

          <p className="text-gray-600 text-sm mt-4">
            ou appuyez sur <kbd className="px-3 py-2 bg-warm-white/10 border border-gallery-border rounded shadow-sm font-mono text-xs text-gray-400">Échap</kbd>
          </p>
        </motion.div>
      )}

      {/* Signature discrète */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-gray-700 text-xs tracking-widest">
          LA GALLERIE
        </p>
        <p className="text-gray-800 text-xs mt-1">
          Collection du Metropolitan Museum of Art
        </p>
      </motion.div>
    </motion.div>
  );
};
