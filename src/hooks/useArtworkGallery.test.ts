import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useArtworkGallery } from './useArtworkGallery';
import { metMuseumService } from '../services/metMuseumApi';
import type { Artwork } from '../services/metMuseumApi';

// Mock metMuseumService
vi.mock('../services/metMuseumApi', () => ({
  metMuseumService: {
    getRandomArtwork: vi.fn(),
  },
}));

const mockArtwork: Artwork = {
  objectID: 1,
  title: 'Test Artwork',
  artistDisplayName: 'Test Artist',
  primaryImage: 'https://example.com/image.jpg',
  medium: 'Oil on canvas',
  dimensions: '100 x 100 cm',
  department: 'European Paintings',
  objectDate: '2020',
};

const mockArtwork2: Artwork = {
  ...mockArtwork,
  objectID: 2,
  title: 'Test Artwork 2',
  primaryImage: 'https://example.com/image2.jpg',
};

describe('useArtworkGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Image constructor with controlled behavior
    globalThis.Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 100);
      }
    } as unknown as typeof Image;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadInitialArtwork', () => {
    it('should load initial artwork successfully', async () => {
      vi.mocked(metMuseumService.getRandomArtwork)
        .mockResolvedValueOnce(mockArtwork)
        .mockResolvedValueOnce(mockArtwork2);

      const { result } = renderHook(() => useArtworkGallery());

      expect(result.current.currentArtwork).toBeNull();
      expect(result.current.isLoadingArtwork).toBe(false);

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.currentArtwork).toBeTruthy();
      });

      expect(result.current.currentArtwork?.objectID).toBe(1);
      expect(result.current.nextArtwork?.objectID).toBe(2);
      expect(result.current.isLoadingArtwork).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle artwork fetch failure', async () => {
      vi.mocked(metMuseumService.getRandomArtwork).mockRejectedValueOnce(
        new Error('Failed to fetch artwork')
      );

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Le hook réessaie 5 fois, puis remplace l'erreur du service par son message final
      expect(result.current.error).toContain('Unable to load any artwork');
      expect(result.current.currentArtwork).toBeNull();
      expect(result.current.isLoadingArtwork).toBe(false);
    });

    it('should give up after the 30s preload timeout on every attempt', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        // Image qui ne se charge jamais : seul le délai de 30 s du hook la rejette
        globalThis.Image = class {
          onload: (() => void) | null = null;
          onerror: (() => void) | null = null;
          src = '';
        } as unknown as typeof Image;

        vi.mocked(metMuseumService.getRandomArtwork).mockResolvedValue(mockArtwork);

        const { result } = renderHook(() => useArtworkGallery());

        await act(async () => {
          const loading = result.current.loadInitialArtwork();
          await vi.advanceTimersByTimeAsync(5 * 30000);
          await loading;
        });

        expect(result.current.error).toContain('Unable to load any artwork');
        expect(result.current.currentArtwork).toBeNull();
        expect(result.current.isLoadingArtwork).toBe(false);
      } finally {
        vi.mocked(metMuseumService.getRandomArtwork).mockReset();
        vi.useRealTimers();
      }
    });

    it('should handle image load failure', async () => {
      // Mock Image that fails to load
      globalThis.Image = class {
        onload: (() => void) | null = null;
        onerror: ((error: Error) => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Image load failed'));
            }
          }, 50);
        }
      } as unknown as typeof Image;

      vi.mocked(metMuseumService.getRandomArtwork).mockResolvedValueOnce(mockArtwork);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toContain('Unable to load any artwork');
    });

    it('should not reload if already loaded', async () => {
      vi.mocked(metMuseumService.getRandomArtwork)
        .mockResolvedValueOnce(mockArtwork)
        .mockResolvedValueOnce(mockArtwork2);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.currentArtwork).toBeTruthy();
      });

      const fetchCallCount = vi.mocked(metMuseumService.getRandomArtwork).mock.calls.length;

      // Try loading again
      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      // Should not fetch again
      expect(vi.mocked(metMuseumService.getRandomArtwork).mock.calls.length).toBe(fetchCallCount);
    });

    it('should handle null artwork from service', async () => {
      vi.mocked(metMuseumService.getRandomArtwork).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.isLoadingArtwork).toBe(false);
      });

      expect(result.current.currentArtwork).toBeNull();
    });

    it('should handle artwork without primaryImage', async () => {
      const artworkNoImage = { ...mockArtwork, primaryImage: '' };
      vi.mocked(metMuseumService.getRandomArtwork).mockResolvedValueOnce(artworkNoImage);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      // Hook should retry recursively
      await waitFor(() => {
        expect(result.current.isLoadingArtwork).toBe(false);
      });
    });
  });

  describe('goToNextArtwork', () => {
    it('should navigate to next artwork', async () => {
      const mockArtwork3: Artwork = {
        ...mockArtwork,
        objectID: 3,
        title: 'Test Artwork 3',
        primaryImage: 'https://example.com/image3.jpg',
      };

      vi.mocked(metMuseumService.getRandomArtwork)
        .mockResolvedValueOnce(mockArtwork)
        .mockResolvedValueOnce(mockArtwork2)
        .mockResolvedValueOnce(mockArtwork3);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.currentArtwork?.objectID).toBe(1);
        expect(result.current.nextArtwork?.objectID).toBe(2);
      });

      await act(async () => {
        await result.current.goToNextArtwork();
      });

      await waitFor(() => {
        expect(result.current.currentArtwork?.objectID).toBe(2);
      });

      // Should preload artwork 3
      await waitFor(() => {
        expect(result.current.nextArtwork?.objectID).toBe(3);
      });
    });

    it('should fetch and show a new artwork when none was preloaded', async () => {
      // Une seule œuvre disponible au chargement : la suivante reste vide
      vi.mocked(metMuseumService.getRandomArtwork).mockResolvedValueOnce(mockArtwork);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      expect(result.current.currentArtwork?.objectID).toBe(1);
      expect(result.current.nextArtwork).toBeNull();

      vi.mocked(metMuseumService.getRandomArtwork).mockResolvedValueOnce(mockArtwork2);

      await act(async () => {
        await result.current.goToNextArtwork();
      });

      expect(result.current.currentArtwork?.objectID).toBe(2);
      expect(result.current.error).toBeNull();
    });

    it('should handle preload failure for N+2 artwork', async () => {
      vi.mocked(metMuseumService.getRandomArtwork)
        .mockResolvedValueOnce(mockArtwork)
        .mockResolvedValueOnce(mockArtwork2)
        .mockRejectedValueOnce(new Error('Failed to fetch N+2'));

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.currentArtwork).toBeTruthy();
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await act(async () => {
        await result.current.goToNextArtwork();
      });

      // Should still transition to next artwork even if N+2 preload fails
      await waitFor(() => {
        expect(result.current.currentArtwork?.objectID).toBe(2);
      });

      consoleWarnSpy.mockRestore();
    });
  });

  describe('image preloading', () => {
    it('should preload images in background', async () => {
      const imageLoadSpy = vi.fn();

      globalThis.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        _src = '';

        set src(value: string) {
          this._src = value;
          imageLoadSpy(value);
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 50);
        }

        get src() {
          return this._src;
        }
      } as unknown as typeof Image;

      vi.mocked(metMuseumService.getRandomArtwork)
        .mockResolvedValueOnce(mockArtwork)
        .mockResolvedValueOnce(mockArtwork2);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.currentArtwork).toBeTruthy();
        expect(result.current.nextArtwork).toBeTruthy();
      });

      // Should have preloaded both images
      expect(imageLoadSpy).toHaveBeenCalledWith(mockArtwork.primaryImage);
      expect(imageLoadSpy).toHaveBeenCalledWith(mockArtwork2.primaryImage);
    });

    it('should handle CORS errors on image load', async () => {
      globalThis.Image = class {
        onload: (() => void) | null = null;
        onerror: ((error: Error) => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              const corsError = new Error('CORS error');
              corsError.name = 'SecurityError';
              this.onerror(corsError);
            }
          }, 50);
        }
      } as unknown as typeof Image;

      vi.mocked(metMuseumService.getRandomArtwork).mockResolvedValueOnce(mockArtwork);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    it('should handle 404 image URLs', async () => {
      globalThis.Image = class {
        onload: (() => void) | null = null;
        onerror: ((error: Error) => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('404 Not Found'));
            }
          }, 50);
        }
      } as unknown as typeof Image;

      vi.mocked(metMuseumService.getRandomArtwork).mockResolvedValueOnce(mockArtwork);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('error recovery', () => {
    it('should clear a transient error once a retry loads an artwork', async () => {
      vi.mocked(metMuseumService.getRandomArtwork)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockArtwork)
        .mockResolvedValueOnce(mockArtwork2);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      // Gallery affiche l'erreur à la place de l'œuvre : elle ne doit pas survivre au succès
      expect(result.current.currentArtwork?.objectID).toBe(1);
      expect(result.current.error).toBeNull();
    });
  });

  describe('race conditions', () => {
    it('should handle rapid navigation clicks', async () => {
      vi.mocked(metMuseumService.getRandomArtwork)
        .mockResolvedValueOnce(mockArtwork)
        .mockResolvedValueOnce(mockArtwork2)
        .mockResolvedValue({ ...mockArtwork, objectID: 99 });

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.currentArtwork).toBeTruthy();
      });

      // Rapid navigation
      await act(async () => {
        result.current.goToNextArtwork();
        result.current.goToNextArtwork();
        result.current.goToNextArtwork();
      });

      // Should handle gracefully without crashes
      await waitFor(() => {
        expect(result.current.currentArtwork).toBeTruthy();
      });
    });
  });
});
