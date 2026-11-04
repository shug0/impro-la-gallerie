import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface TouchControlsProps {
  onHide: () => void;
  onToggleFullscreen: () => void;
  onNext: () => void;
  onEnd: () => void;
}

const ICON_BUTTON_CLASSES =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gallery-border/60 text-warm-white active:bg-warm-white/20";

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/**
 * Barre de commandes en bas d'écran, affichée seulement sur un appareil tactile
 * (`pointer-coarse:`). Chaque bouton reprend un raccourci clavier :
 * Espace (masquer), F (plein écran), Entrée (suivante), E (fin).
 * Sa hauteur est réservée par l'utilitaire `bottom-touch-bar` (index.css).
 */
export const TouchControls = ({
  onHide,
  onToggleFullscreen,
  onNext,
  onEnd,
}: TouchControlsProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="absolute inset-x-0 bottom-0 z-40 hidden h-touch-bar items-start gap-3 bg-black/60 px-4 pt-3 pointer-coarse:flex"
  >
    <button type="button" aria-label="Masquer l'interface" onClick={onHide} className={ICON_BUTTON_CLASSES}>
      <Icon>
        <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c5 0 9 4.5 10 7a13 13 0 0 1-2.4 3.4" />
        <path d="M6.6 6.6C4.4 8 2.8 10.2 2 12c1 2.5 5 7 10 7 1.9 0 3.6-.6 5.1-1.6" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        <path d="m2 2 20 20" />
      </Icon>
    </button>

    <button type="button" aria-label="Plein écran" onClick={onToggleFullscreen} className={ICON_BUTTON_CLASSES}>
      <Icon>
        <path d="M15 3h6v6" />
        <path d="M9 21H3v-6" />
        <path d="m21 3-7 7" />
        <path d="m3 21 7-7" />
      </Icon>
    </button>

    <button
      type="button"
      onClick={onNext}
      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-warm-white font-display text-lg tracking-wider text-black active:bg-gray-200"
    >
      Suivante
      <Icon>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </Icon>
    </button>

    <button type="button" aria-label="Fin" onClick={onEnd} className={ICON_BUTTON_CLASSES}>
      <Icon>
        <path d="M4 22V4" />
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1" />
      </Icon>
    </button>
  </motion.div>
);
