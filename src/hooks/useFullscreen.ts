import { useState, useCallback, useEffect } from "react";

/**
 * Hook pour gérer le mode plein écran
 * @returns {isFullscreen, toggleFullscreen, enterFullscreen, exitFullscreen}
 */
export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Écouter les changements de plein écran (ex: touche ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (error) {
      console.error("Erreur lors du passage en plein écran:", error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      await document.exitFullscreen();
      setIsFullscreen(false);
    } catch (error) {
      console.error("Erreur lors de la sortie du plein écran:", error);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  return { isFullscreen, toggleFullscreen, enterFullscreen, exitFullscreen };
};
