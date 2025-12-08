import { motion } from "framer-motion";
import { Button } from "../ui/Button";

export interface ErrorRecoveryProps {
  error: string;
  onRetry: () => void;
  onSkip?: () => void;
  className?: string;
}

/**
 * Component pour afficher les erreurs avec options de récupération
 * - Message d'erreur clair
 * - Bouton "Réessayer"
 * - Bouton "Passer" (optionnel)
 */
export const ErrorRecovery = ({
  error,
  onRetry,
  onSkip,
  className = "",
}: ErrorRecoveryProps) => {
  return (
    <motion.div
      className={`absolute inset-0 bg-black flex flex-col items-center justify-center p-8 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon d'erreur */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
          <span className="text-6xl">⚠️</span>
        </div>
      </motion.div>

      {/* Message d'erreur */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-warm-white text-2xl md:text-3xl font-display mb-4 text-center max-w-2xl"
      >
        Oups, une erreur est survenue
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 text-lg text-center max-w-xl mb-8"
      >
        {error}
      </motion.p>

      {/* Boutons d'action */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Bouton Réessayer */}
        <Button onClick={onRetry} variant="secondary" size="md" className="min-w-[200px] rounded-lg" enableMotion={false}>
          🔄 Réessayer
        </Button>

        {/* Bouton Passer (si disponible) */}
        {onSkip && (
          <Button onClick={onSkip} variant="ghost" size="md" className="min-w-[200px] rounded-lg" enableMotion={false}>
            ⏭️ Passer
          </Button>
        )}
      </motion.div>

      {/* Aide supplémentaire */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-gray-500 text-sm">
          Si le problème persiste, vérifiez votre connexion internet
        </p>
        <p className="text-gray-600 text-xs mt-2">
          Appuyez sur Entrée pour réessayer
        </p>
      </motion.div>
    </motion.div>
  );
};
