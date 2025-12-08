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
    global.Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 100);
      }
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadInitialArtwork', () => {
    it('should load initial artwork successfully', async () => {
      (metMuseumService.getRandomArtwork as any)
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
      (metMuseumService.getRandomArtwork as any).mockRejectedValueOnce(
        new Error('Failed to fetch artwork')
      );

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toBe('Failed to fetch artwork');
      expect(result.current.currentArtwork).toBeNull();
      expect(result.current.isLoadingArtwork).toBe(false);
    });

    it('should handle image preload timeout', async () => {
      // Mock Image with timeout
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: ((error: Error) => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Image load timeout'));
            }
          }, 11000); // Exceed 10s timeout
        }
      } as any;

      (metMuseumService.getRandomArtwork as any).mockResolvedValueOnce(mockArtwork);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      }, { timeout: 12000 });
    });

    it('should handle image load failure', async () => {
      // Mock Image that fails to load
      global.Image = class {
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
      } as any;

      (metMuseumService.getRandomArtwork as any).mockResolvedValueOnce(mockArtwork);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toContain('Failed to initialize gallery');
    });

    it('should not reload if already loaded', async () => {
      (metMuseumService.getRandomArtwork as any)
        .mockResolvedValueOnce(mockArtwork)
        .mockResolvedValueOnce(mockArtwork2);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.currentArtwork).toBeTruthy();
      });

      const fetchCallCount = (metMuseumService.getRandomArtwork as any).mock.calls.length;

      // Try loading again
      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      // Should not fetch again
      expect((metMuseumService.getRandomArtwork as any).mock.calls.length).toBe(fetchCallCount);
    });

    it('should handle null artwork from service', async () => {
      (metMuseumService.getRandomArtwork as any).mockResolvedValueOnce(null);

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
      (metMuseumService.getRandomArtwork as any).mockResolvedValueOnce(artworkNoImage);

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

      (metMuseumService.getRandomArtwork as any)
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

    it('should handle no next artwork available', async () => {
      (metMuseumService.getRandomArtwork as any).mockResolvedValueOnce(mockArtwork);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      // Force nextArtwork to be null
      await waitFor(() => {
        expect(result.current.currentArtwork).toBeTruthy();
      });

      // Manually set nextArtwork to null for testing
      (result.current as any).nextArtwork = null;

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await act(async () => {
        await result.current.goToNextArtwork();
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith('No next artwork available');

      consoleWarnSpy.mockRestore();
    });

    it('should handle preload failure for N+2 artwork', async () => {
      (metMuseumService.getRandomArtwork as any)
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

      global.Image = class {
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
      } as any;

      (metMuseumService.getRandomArtwork as any)
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
      global.Image = class {
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
      } as any;

      (metMuseumService.getRandomArtwork as any).mockResolvedValueOnce(mockArtwork);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    it('should handle 404 image URLs', async () => {
      global.Image = class {
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
      } as any;

      (metMuseumService.getRandomArtwork as any).mockResolvedValueOnce(mockArtwork);

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
    it('should clear error when loading new artwork', async () => {
      (metMuseumService.getRandomArtwork as any)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockArtwork)
        .mockResolvedValueOnce(mockArtwork2);

      const { result } = renderHook(() => useArtworkGallery());

      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Try again - should clear error
      await act(async () => {
        await result.current.loadInitialArtwork();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.currentArtwork).toBeTruthy();
      });
    });
  });

  describe('race conditions', () => {
    it('should handle rapid navigation clicks', async () => {
      (metMuseumService.getRandomArtwork as any)
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
