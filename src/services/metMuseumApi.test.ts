import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { metMuseumService } from './metMuseumApi';

// Mock fetch globally
global.fetch = vi.fn();

describe('MetMuseumService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset service state
    (metMuseumService as any).objectIds = [];
    (metMuseumService as any).initialized = false;
    (metMuseumService as any).cache.clear();
    (metMuseumService as any).usedIds.clear();
    (metMuseumService as any).mode = 'exploration';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully in exploration mode', async () => {
      // Mock successful department searches
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/search')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ objectIDs: [1, 2, 3, 4, 5] }),
          });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      await metMuseumService.initialize();

      expect(metMuseumService.isInitialized).toBe(true);
      expect(metMuseumService.availableArtworksCount).toBeGreaterThan(0);
    });

    it('should initialize successfully in masterpieces mode', async () => {
      metMuseumService.setMode('masterpieces');

      // Mock successful highlights search
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ objectIDs: [10, 20, 30, 40, 50] }),
      });

      await metMuseumService.initialize();

      expect(metMuseumService.isInitialized).toBe(true);
      expect(metMuseumService.availableArtworksCount).toBe(5);
    });

    it('should handle API returning HTML instead of JSON', async () => {
      // This simulates the error we found: /search without q parameter returns HTML
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token \'<\', "<!DOCTYPE "... is not valid JSON');
        },
      });

      await expect(metMuseumService.initialize()).rejects.toThrow();
    });

    it('should handle network errors during initialization', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(metMuseumService.initialize()).rejects.toThrow('Network error');
    });

    it('should handle HTTP errors (404, 500, etc)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(metMuseumService.initialize()).rejects.toThrow('HTTP 500');
    });

    it('should handle empty objectIDs response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ objectIDs: [] }),
      });

      await expect(metMuseumService.initialize()).rejects.toThrow('No objects with images found');
    });

    it('should handle missing objectIDs in response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await expect(metMuseumService.initialize()).rejects.toThrow('No objects with images found');
    });

    it('should deduplicate object IDs', async () => {
      // Mock multiple departments returning some duplicate IDs
      (global.fetch as any).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ objectIDs: [1, 2, 3, 1, 2, 3] }),
        })
      );

      await metMuseumService.initialize();

      // Should have deduplicated IDs (3 unique from 6 total across departments)
      expect(metMuseumService.availableArtworksCount).toBeLessThanOrEqual(18); // 3 per dept * 6 depts
    });

    it('should continue if one department fails in exploration mode', async () => {
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First department fails
          return Promise.reject(new Error('Department unavailable'));
        }
        // Other departments succeed
        return Promise.resolve({
          ok: true,
          json: async () => ({ objectIDs: [1, 2, 3] }),
        });
      });

      await metMuseumService.initialize();

      expect(metMuseumService.isInitialized).toBe(true);
      expect(metMuseumService.availableArtworksCount).toBeGreaterThan(0);
    });
  });

  describe('getRandomArtwork', () => {
    beforeEach(async () => {
      // Mock successful initialization
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ objectIDs: [1, 2, 3, 4, 5] }),
      });
      await metMuseumService.initialize();
    });

    it('should fetch artwork successfully', async () => {
      const mockArtwork = {
        objectID: 1,
        title: 'Test Artwork',
        artistDisplayName: 'Test Artist',
        primaryImage: 'https://example.com/image.jpg',
        medium: 'Oil on canvas',
        dimensions: '100 x 100 cm',
        department: 'European Paintings',
        objectDate: '2020',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArtwork,
      });

      const artwork = await metMuseumService.getRandomArtwork();

      expect(artwork).toBeTruthy();
      expect(artwork?.title).toBe('Test Artwork');
      expect(artwork?.primaryImage).toBe('https://example.com/image.jpg');
    });

    it('should skip artworks without primaryImage', async () => {
      const mockArtworkNoImage = {
        objectID: 1,
        title: 'Test Artwork',
        artistDisplayName: 'Test Artist',
        primaryImage: '', // No image
        medium: 'Oil on canvas',
        dimensions: '100 x 100 cm',
        department: 'European Paintings',
        objectDate: '2020',
      };

      const mockArtworkWithImage = {
        ...mockArtworkNoImage,
        objectID: 2,
        primaryImage: 'https://example.com/image.jpg',
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockArtworkNoImage,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockArtworkWithImage,
        });

      const artwork = await metMuseumService.getRandomArtwork();

      expect(artwork?.objectID).toBe(2);
      expect(artwork?.primaryImage).toBe('https://example.com/image.jpg');
    });

    it('should skip artworks without title', async () => {
      const mockArtworkNoTitle = {
        objectID: 1,
        title: '',
        artistDisplayName: 'Test Artist',
        primaryImage: 'https://example.com/image.jpg',
        medium: 'Oil on canvas',
        dimensions: '100 x 100 cm',
        department: 'European Paintings',
        objectDate: '2020',
      };

      const mockArtworkWithTitle = {
        ...mockArtworkNoTitle,
        objectID: 2,
        title: 'Valid Artwork',
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockArtworkNoTitle,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockArtworkWithTitle,
        });

      const artwork = await metMuseumService.getRandomArtwork();

      expect(artwork?.title).toBe('Valid Artwork');
    });

    it('should handle 404 errors for individual artworks', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const artwork = await metMuseumService.getRandomArtwork();

      // Should return null after retries
      expect(artwork).toBeNull();
    });

    it('should retry up to 3 times on failure', async () => {
      let attempts = 0;
      (global.fetch as any).mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            objectID: 1,
            title: 'Success',
            primaryImage: 'https://example.com/image.jpg',
            artistDisplayName: 'Artist',
            medium: 'Oil',
            dimensions: '100x100',
            department: 'Dept',
            objectDate: '2020',
          }),
        });
      });

      const artwork = await metMuseumService.getRandomArtwork();

      expect(artwork).toBeTruthy();
      expect(attempts).toBe(3);
    });

    it('should handle malformed JSON responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      });

      const artwork = await metMuseumService.getRandomArtwork();

      expect(artwork).toBeNull();
    });

    it('should provide default values for missing fields', async () => {
      const mockArtworkMinimal = {
        objectID: 1,
        title: 'Test',
        primaryImage: 'https://example.com/image.jpg',
        // Missing: artistDisplayName, medium, dimensions, department, objectDate
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArtworkMinimal,
      });

      const artwork = await metMuseumService.getRandomArtwork();

      expect(artwork?.artistDisplayName).toBe('Unknown Artist');
      expect(artwork?.medium).toBe('Unknown Medium');
      expect(artwork?.dimensions).toBe('Unknown Dimensions');
      expect(artwork?.department).toBe('Unknown Department');
      expect(artwork?.objectDate).toBe('Unknown Date');
    });
  });

  describe('mode switching', () => {
    it('should reset when mode changes after initialization', async () => {
      // Initialize in exploration mode
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ objectIDs: [1, 2, 3] }),
      });

      await metMuseumService.initialize();
      expect(metMuseumService.currentMode).toBe('exploration');

      // Change to masterpieces mode
      metMuseumService.setMode('masterpieces');

      expect(metMuseumService.isInitialized).toBe(false);
      expect(metMuseumService.availableArtworksCount).toBe(0);
    });

    it('should not reset if mode stays the same', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ objectIDs: [1, 2, 3] }),
      });

      await metMuseumService.initialize();
      const countBefore = metMuseumService.availableArtworksCount;

      metMuseumService.setMode('exploration'); // Same mode

      expect(metMuseumService.isInitialized).toBe(true);
      expect(metMuseumService.availableArtworksCount).toBe(countBefore);
    });
  });

  describe('cache management', () => {
    it('should cache fetched artworks', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ objectIDs: [1, 2, 3] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            objectID: 1,
            title: 'Cached',
            primaryImage: 'https://example.com/image.jpg',
            artistDisplayName: 'Artist',
            medium: 'Oil',
            dimensions: '100x100',
            department: 'Dept',
            objectDate: '2020',
          }),
        });

      await metMuseumService.initialize();
      await metMuseumService.getRandomArtwork();

      expect(metMuseumService.cachedArtworksCount).toBe(1);
    });

    it('should clear cache when requested', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ objectIDs: [1, 2, 3] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            objectID: 1,
            title: 'Cached',
            primaryImage: 'https://example.com/image.jpg',
            artistDisplayName: 'Artist',
            medium: 'Oil',
            dimensions: '100x100',
            department: 'Dept',
            objectDate: '2020',
          }),
        });

      await metMuseumService.initialize();
      await metMuseumService.getRandomArtwork();

      metMuseumService.clearCache();

      expect(metMuseumService.cachedArtworksCount).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle timeout scenarios', async () => {
      const timeoutError = new Error('Timeout');
      timeoutError.name = 'AbortError';

      (global.fetch as any).mockRejectedValueOnce(timeoutError);

      await expect(metMuseumService.initialize()).rejects.toThrow();
    });

    it('should handle CORS errors', async () => {
      const corsError = new Error('CORS error');
      corsError.name = 'TypeError';

      (global.fetch as any).mockRejectedValueOnce(corsError);

      await expect(metMuseumService.initialize()).rejects.toThrow();
    });

    it('should handle rate limiting (429)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      await expect(metMuseumService.initialize()).rejects.toThrow('HTTP 429');
    });
  });
});
