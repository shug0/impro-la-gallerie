import { motion } from "framer-motion";
import type { Artwork } from "../../services/metMuseumApi";

export interface ArtworkMetadataProps {
  artwork: Artwork;
  imageRatio: 'landscape' | 'portrait';
  isVisible?: boolean;
  className?: string;
}

/**
 * Component pour afficher les métadonnées d'une œuvre
 * - Positionnement adaptatif selon le ratio de l'image
 * - Landscape: en bas (pleine largeur)
 * - Portrait: à droite (hauteur pleine)
 * - Style minimaliste sur fond sombre
 */
export const ArtworkMetadata = ({
  artwork,
  imageRatio,
  isVisible = true,
  className = "",
}: ArtworkMetadataProps) => {
  // Positionnement selon le ratio de l'image
  const isLandscape = imageRatio === 'landscape';

  const positionClasses = isLandscape
    ? 'absolute bottom-0 left-0 right-0'  // Bas, pleine largeur
    : 'absolute right-0 top-0 bottom-0 w-96';  // Droite, largeur fixe

  // Direction de l'animation selon le positionnement
  const animationProps = isLandscape
    ? { y: isVisible ? 0 : 20 }  // Slide depuis le bas
    : { x: isVisible ? 0 : 20 };  // Slide depuis la droite

  return (
    <motion.div
      className={`${positionClasses} ${className}`}
      initial={{
        opacity: 0,
        ...(isLandscape ? { y: 20 } : { x: 20 }),
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        ...animationProps,
      }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
    >
      {/* Gradient background pour lisibilité */}
      <div
        className={`
          h-full
          ${isLandscape
            ? 'bg-gradient-to-t from-black/90 via-black/70 to-transparent'
            : 'bg-gradient-to-l from-black/90 via-black/70 to-transparent'
          }
        `}
      >
        <div className="p-8 h-full flex flex-col justify-end">
          {/* Titre de l'œuvre */}
          <h2 className="text-warm-white text-2xl md:text-3xl font-display mb-2 leading-tight">
            {artwork.title}
          </h2>

          {/* Artiste */}
          <p className="text-gray-300 text-lg md:text-xl mb-4">
            {artwork.artistDisplayName}
          </p>

          {/* Informations secondaires */}
          <div className="text-gray-400 text-sm md:text-base space-y-1">
            {artwork.objectDate && (
              <p className="font-medium">{artwork.objectDate}</p>
            )}

            {artwork.medium && (
              <p>{artwork.medium}</p>
            )}

            {artwork.dimensions && (
              <p className="text-xs md:text-sm text-gray-500">{artwork.dimensions}</p>
            )}

            {artwork.department && (
              <p className="text-xs text-gray-500 mt-2 italic">
                {artwork.department}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
