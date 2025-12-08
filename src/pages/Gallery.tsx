import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFullscreen } from "../hooks/useFullscreen";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useMetMuseum } from "../hooks/useMetMuseum";
import { useArtworkGallery } from "../hooks/useArtworkGallery";
import { ConfigurationScreen } from "../components/screens/ConfigurationScreen";
import { LoadingScreen } from "../components/screens/LoadingScreen";
import { WaitingScreen } from "../components/screens/WaitingScreen";
import { ArtworkDisplay } from "../components/artwork/ArtworkDisplay";
import { ArtworkMetadata } from "../components/artwork/ArtworkMetadata";
import { ErrorRecovery } from "../components/screens/ErrorRecovery";
import { EndScreen } from "../components/screens/EndScreen";
import { Button } from "../components/ui/Button";
import { getRandomQuote } from "../data/quotes";
import type { GalleryMode } from "../services/metMuseumApi";

type GalleryStatus =
  | 'configuration'  // Choix du mode
  | 'loading'        // Chargement des œuvres
  | 'error'          // Erreur de chargement
  | 'waiting'        // Page de présentation
  | 'artwork'        // Affichage des œuvres
  | 'end';           // Écran de fin

export default function Gallery() {
  // Système de statut pour gérer les écrans
  const [status, setStatus] = useState<GalleryStatus>('configuration');
  const [selectedMode, setSelectedMode] = useState<GalleryMode>('masterpieces');
  const [isHidden, setIsHidden] = useState(false);
  const [imageRatio, setImageRatio] = useState<'landscape' | 'portrait'>('landscape');

  // Citation qui change toutes les 5 secondes pendant le chargement
  const [loadingQuote, setLoadingQuote] = useState(() => getRandomQuote());

  // Citation qui change toutes les 15 secondes sur la page d'attente
  const [waitingQuote, setWaitingQuote] = useState(() => getRandomQuote());

  const { toggleFullscreen } = useFullscreen();
  const { isLoading, isReady, error, artworksCount, initialize, retry } = useMetMuseum();
  const {
    currentArtwork,
    nextArtwork,
    isLoadingArtwork,
    error: artworkError,
    loadInitialArtwork,
    goToNextArtwork,
  } = useArtworkGallery();

  // Synchroniser le statut avec les états du hook useMetMuseum
  useEffect(() => {
    if (status === 'configuration') return;

    if (error) {
      setStatus('error');
    } else if (isLoading) {
      setStatus('loading');
    } else if (isReady && status === 'loading') {
      setStatus('waiting');
    }
  }, [status, error, isLoading, isReady]);

  // Rotation des citations pendant le chargement (toutes les 5 secondes)
  useEffect(() => {
    if (status !== 'loading') return;

    const interval = setInterval(() => {
      setLoadingQuote(getRandomQuote());
    }, 5000);

    return () => clearInterval(interval);
  }, [status]);

  // Rotation des citations sur la page d'attente (toutes les 15 secondes)
  useEffect(() => {
    if (status !== 'waiting') return;

    const interval = setInterval(() => {
      setWaitingQuote(getRandomQuote());
    }, 15000);

    return () => clearInterval(interval);
  }, [status]);

  // Charger première œuvre quand isReady devient true
  useEffect(() => {
    if (isReady && !currentArtwork && !isLoadingArtwork) {
      loadInitialArtwork();
    }
  }, [isReady, currentArtwork, isLoadingArtwork, loadInitialArtwork]);

  // Handler pour changer le mode (avant lancement)
  const handleModeChange = useCallback((newMode: GalleryMode) => {
    setSelectedMode(newMode);
  }, []);

  // Handler pour lancer la galerie (trigger loading)
  const handleLaunchGallery = useCallback(() => {
    initialize(selectedMode);
    setStatus('loading');
  }, [selectedMode, initialize]);

  const toggleHidden = useCallback(() => {
    setIsHidden(prev => !prev);
  }, []);

  const handleShowEndScreen = useCallback(() => {
    setStatus('end');
  }, []);

  const handleCloseEndScreen = useCallback(() => {
    // Retourner à l'affichage des œuvres seulement si on a une œuvre
    if (currentArtwork) {
      setStatus('artwork');
    } else {
      // Si pas d'œuvre, retourner à la page d'attente
      setStatus('waiting');
    }
  }, [currentArtwork]);

  // Navigation entre les pages et les œuvres
  const handleNext = useCallback(() => {
    switch (status) {
      case 'configuration':
        handleLaunchGallery();
        break;
      case 'waiting':
        setStatus('artwork');
        break;
      case 'artwork':
        goToNextArtwork();
        break;
    }
  }, [status, handleLaunchGallery, goToNextArtwork]);

  // Configuration des raccourcis clavier
  useKeyboardShortcuts(
    [
      {
        code: "Space",
        handler: toggleHidden,
        preventDefault: true,
      },
      {
        key: "Enter",
        handler: handleNext,
        preventDefault: false,
      },
      {
        key: "f",
        handler: toggleFullscreen,
        preventDefault: false,
      },
      {
        key: "e",
        handler: handleShowEndScreen,
        preventDefault: false,
      },
      {
        key: "Escape",
        handler: handleCloseEndScreen,
        preventDefault: false,
      },
    ],
    [toggleHidden, handleNext, toggleFullscreen, handleShowEndScreen, handleCloseEndScreen]
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Overlay noir pour le toggle fade (régie) */}
      <AnimatePresence>
        {isHidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black z-50"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {(() => {
          switch (status) {
            case 'configuration':
              return (
                <ConfigurationScreen
                  key="configuration"
                  mode={selectedMode}
                  onModeChange={handleModeChange}
                  onLaunch={handleLaunchGallery}
                />
              );

            case 'loading':
              return (
                <LoadingScreen
                  key="loading"
                  quote={loadingQuote}
                />
              );

            case 'error':
              return (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black flex flex-col items-center justify-center"
                >
                  <p className="text-red-400 text-xl mb-4 font-display">Erreur : {error}</p>
                  <Button onClick={retry} size="md" enableMotion={false}>
                    Réessayer
                  </Button>
                </motion.div>
              );

            case 'waiting':
              return (
                <WaitingScreen
                  key="waiting"
                  quote={waitingQuote}
                  artworksCount={artworksCount}
                  currentArtwork={currentArtwork}
                />
              );

            case 'end':
              return (
                <EndScreen
                  key="end-screen"
                  onClose={handleCloseEndScreen}
                />
              );

            case 'artwork':
              return (
          <motion.div
            key="artwork-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-black"
          >
            {artworkError ? (
              /* Erreur lors du chargement d'une œuvre */
              <ErrorRecovery
                error={artworkError}
                onRetry={() => {
                  // Réessayer de charger une œuvre
                  if (currentArtwork) {
                    goToNextArtwork(); // Essayer l'œuvre suivante
                  } else {
                    loadInitialArtwork(); // Réessayer la première œuvre
                  }
                }}
                onSkip={currentArtwork ? goToNextArtwork : undefined}
              />
            ) : currentArtwork ? (
              <>
                {/* Image + double buffer */}
                <ArtworkDisplay
                  currentArtwork={currentArtwork}
                  nextArtwork={nextArtwork}
                  onImageLoad={(ratio) => setImageRatio(ratio)}
                />

                {/* Métadonnées (positionnement adaptatif) */}
                <ArtworkMetadata
                  artwork={currentArtwork}
                  imageRatio={imageRatio}
                  isVisible={!isHidden}
                />
              </>
            ) : isLoadingArtwork ? (
              /* Loading initial artwork */
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-2 border-gallery-gray border-t-transparent rounded-full"
                />
              </div>
            ) : null}
          </motion.div>
              );

            default:
              return null;
          }
        })()}
      </AnimatePresence>
    </div>
  );
}
