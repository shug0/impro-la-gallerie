import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ProgressiveImageProps {
  src: string;
  lowResSrc?: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const ProgressiveImage = ({ 
  src, 
  lowResSrc, 
  alt, 
  className = '', 
  onLoad,
  onError 
}: ProgressiveImageProps) => {
  const [lowResLoaded, setLowResLoaded] = useState(false);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const highResRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Start loading high-res image immediately
    if (src) {
      const img = new Image();
      img.onload = () => {
        setHighResLoaded(true);
        onLoad?.();
      };
      img.onerror = () => {
        setHasError(true);
        onError?.();
      };
      img.src = src;
    }
  }, [src, onLoad, onError]);

  const handleLowResLoad = () => {
    setLowResLoaded(true);
  };

  const handleLowResError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 rounded ${className}`}>
        <span className="text-gray-400">Image non disponible</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Low-res placeholder */}
      {lowResSrc && !highResLoaded && (
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: lowResLoaded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          src={lowResSrc}
          alt={alt}
          onLoad={handleLowResLoad}
          onError={handleLowResError}
          className="w-full h-full object-contain filter blur-sm"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
          }}
        />
      )}
      
      {/* High-res image */}
      <motion.img
        ref={highResRef}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: highResLoaded ? 1 : 0,
          scale: highResLoaded ? 1 : 0.5
        }}
        transition={{ duration: 0.5 }}
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        style={{ 
          position: 'relative',
          zIndex: 2
        }}
      />
      
      {/* Loading skeleton */}
      {!lowResLoaded && !highResLoaded && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse"
        />
      )}
      
    </div>
  );
};