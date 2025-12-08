import { motion } from "framer-motion";
import { ModeToggle } from "../ui/ModeToggle";
import { Button } from "../ui/Button";
import type { GalleryMode } from "../../services/metMuseumApi";

export interface ConfigurationScreenProps {
  mode: GalleryMode;
  onModeChange: (mode: GalleryMode) => void;
  onLaunch: () => void;
}

/**
 * Écran de configuration - Premier écran de la galerie
 * - Choix du mode (Chefs-d'œuvre / Exploration libre)
 * - Affichage des raccourcis clavier
 * - Bouton "Lancer la galerie"
 * - Pas de chargement sur cet écran
 */
export const ConfigurationScreen = ({
  mode,
  onModeChange,
  onLaunch,
}: ConfigurationScreenProps) => {
  return (
    <motion.div
      key="configuration"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 bg-black flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col items-center justify-center"
      >
        {/* Titre */}
        <h1 className="font-display text-5xl text-warm-white mb-6 tracking-wide text-center">
          La Gallerie
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-lg text-center mb-12 max-w-xl">
          Choisissez votre mode de découverte
        </p>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <ModeToggle mode={mode} onChange={onModeChange} />
        </motion.div>

        {/* Raccourcis clavier */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-8 mb-12"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <kbd className="px-3 py-2 bg-warm-white/10 border border-gallery-border rounded shadow-sm font-mono text-sm">
              Entrée
            </kbd>
            <span className="text-sm">Suivant</span>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <kbd className="px-3 py-2 bg-warm-white/10 border border-gallery-border rounded shadow-sm font-mono text-sm">
              Espace
            </kbd>
            <span className="text-sm">Régie</span>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <kbd className="px-3 py-2 bg-warm-white/10 border border-gallery-border rounded shadow-sm font-mono text-sm">
              F
            </kbd>
            <span className="text-sm">Plein écran</span>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <kbd className="px-3 py-2 bg-warm-white/10 border border-gallery-border rounded shadow-sm font-mono text-sm">
              E
            </kbd>
            <span className="text-sm">Fin</span>
          </div>
        </motion.div>

        {/* Bouton Lancer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button onClick={onLaunch} size="xl">
            Lancer la galerie
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
