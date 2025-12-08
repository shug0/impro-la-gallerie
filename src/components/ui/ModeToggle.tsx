import { motion } from "framer-motion";
import type { GalleryMode } from "../../services/metMuseumApi";

interface ModeToggleProps {
  mode: GalleryMode;
  onChange: (mode: GalleryMode) => void;
  disabled?: boolean;
}

export const ModeToggle = ({ mode, onChange, disabled = false }: ModeToggleProps) => {
  const isExploration = mode === 'exploration';

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-[#6d6d6d] text-sm tracking-wide">Mode de découverte</p>

      <div className="relative inline-flex items-center bg-warm-white/10 rounded-full p-1 border border-[#6d6d6d]">
        {/* Background slider */}
        <motion.div
          className="absolute top-1 bottom-1 left-1 bg-[#2d2d2d] rounded-full"
          initial={false}
          animate={{
            x: isExploration ? 0 : '100%',
            width: isExploration ? '50%' : '50%',
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Exploration button */}
        <button
          onClick={() => !disabled && onChange('exploration')}
          disabled={disabled}
          className={`
            relative z-10 px-6 py-3 rounded-full transition-colors duration-200
            ${isExploration ? 'text-[#f5f1e8]' : 'text-[#6d6d6d]'}
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            font-display tracking-wide
          `}
        >
          <span className="flex items-center gap-2">
            <span>🌍</span>
            <span className="text-sm">Exploration Libre</span>
          </span>
        </button>

        {/* Masterpieces button */}
        <button
          onClick={() => !disabled && onChange('masterpieces')}
          disabled={disabled}
          className={`
            relative z-10 px-6 py-3 rounded-full transition-colors duration-200
            ${!isExploration ? 'text-[#f5f1e8]' : 'text-[#6d6d6d]'}
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            font-display tracking-wide
          `}
        >
          <span className="flex items-center gap-2">
            <span>⭐</span>
            <span className="text-sm">Chefs-d'Œuvre</span>
          </span>
        </button>
      </div>

      {/* Description */}
      <motion.p
        key={mode}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-[#6d6d6d] text-xs italic text-center max-w-md"
      >
        {isExploration
          ? "Explorez toute la collection : ~189 000 œuvres"
          : "Collection exclusive : ~2 700 chefs-d'œuvre sélectionnés"}
      </motion.p>
    </div>
  );
};
