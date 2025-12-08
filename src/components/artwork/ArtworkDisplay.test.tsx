import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ArtworkDisplay } from './ArtworkDisplay';
import type { Artwork } from '../../services/metMuseumApi';

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

const mockNextArtwork: Artwork = {
  ...mockArtwork,
  objectID: 2,
  title: 'Next Artwork',
  primaryImage: 'https://example.com/image2.jpg',
};

describe('ArtworkDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('image rendering', () => {
    it('should render current artwork image', () => {
      render(<ArtworkDisplay currentArtwork={mockArtwork} nextArtwork={null} />);

      const image = screen.getByAltText('Test Artwork');
      expect(image).toBeTruthy();
      expect(image.getAttribute('src')).toBe('https://example.com/image.jpg');
    });

    it('should show loading spinner initially', () => {
      render(<ArtworkDisplay currentArtwork={mockArtwork} nextArtwork={null} />);

      // Check for spinner (div with rotating animation)
      const spinner = document.querySelector('.border-t-transparent');
      expect(spinner).toBeTruthy();
    });

    it('should hide loading spinner after image loads', async () => {
      render(<ArtworkDisplay currentArtwork={mockArtwork} nextArtwork={null} />);

      const image = screen.getByAltText('Test Artwork') as HTMLImageElement;

      // Simulate image load
      fireEvent.load(image);

      await waitFor(() => {
        const spinner = document.querySelector('.border-t-transparent');
        expect(spinner).toBeFalsy();
      });
    });

    it('should preload next image in DOM (hidden)', () => {
      render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={mockNextArtwork}
        />
      );

      const nextImage = screen.getByAltText('Next Artwork') as HTMLImageElement;
      expect(nextImage).toBeTruthy();
      expect(nextImage.getAttribute('src')).toBe('https://example.com/image2.jpg');

      // Check it's hidden
      expect(nextImage.style.opacity).toBe('0');
      expect(nextImage.style.visibility).toBe('hidden');
    });

    it('should not render next image if null', () => {
      render(<ArtworkDisplay currentArtwork={mockArtwork} nextArtwork={null} />);

      const images = screen.getAllByRole('img');
      expect(images.length).toBe(1); // Only current image
    });
  });

  describe('aspect ratio detection', () => {
    it('should detect landscape ratio (width > height)', async () => {
      const onImageLoad = vi.fn();

      render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={null}
          onImageLoad={onImageLoad}
        />
      );

      const image = screen.getByAltText('Test Artwork') as HTMLImageElement;

      // Mock image dimensions (landscape: 1920x1080)
      Object.defineProperty(image, 'naturalWidth', {
        get: () => 1920,
        configurable: true,
      });
      Object.defineProperty(image, 'naturalHeight', {
        get: () => 1080,
        configurable: true,
      });

      fireEvent.load(image);

      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalledWith('landscape');
      });
    });

    it('should detect portrait ratio (height >= width)', async () => {
      const onImageLoad = vi.fn();

      render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={null}
          onImageLoad={onImageLoad}
        />
      );

      const image = screen.getByAltText('Test Artwork') as HTMLImageElement;

      // Mock image dimensions (portrait: 1080x1920)
      Object.defineProperty(image, 'naturalWidth', {
        get: () => 1080,
        configurable: true,
      });
      Object.defineProperty(image, 'naturalHeight', {
        get: () => 1920,
        configurable: true,
      });

      fireEvent.load(image);

      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalledWith('portrait');
      });
    });

    it('should detect square as portrait (ratio = 1)', async () => {
      const onImageLoad = vi.fn();

      render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={null}
          onImageLoad={onImageLoad}
        />
      );

      const image = screen.getByAltText('Test Artwork') as HTMLImageElement;

      // Mock image dimensions (square: 1000x1000)
      Object.defineProperty(image, 'naturalWidth', {
        get: () => 1000,
        configurable: true,
      });
      Object.defineProperty(image, 'naturalHeight', {
        get: () => 1000,
        configurable: true,
      });

      fireEvent.load(image);

      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalledWith('portrait');
      });
    });

    it('should detect very wide panorama as landscape', async () => {
      const onImageLoad = vi.fn();

      render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={null}
          onImageLoad={onImageLoad}
        />
      );

      const image = screen.getByAltText('Test Artwork') as HTMLImageElement;

      // Mock image dimensions (panorama: 3840x1080)
      Object.defineProperty(image, 'naturalWidth', {
        get: () => 3840,
        configurable: true,
      });
      Object.defineProperty(image, 'naturalHeight', {
        get: () => 1080,
        configurable: true,
      });

      fireEvent.load(image);

      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalledWith('landscape');
      });
    });

    it('should detect tall portrait correctly', async () => {
      const onImageLoad = vi.fn();

      render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={null}
          onImageLoad={onImageLoad}
        />
      );

      const image = screen.getByAltText('Test Artwork') as HTMLImageElement;

      // Mock image dimensions (tall: 600x2400)
      Object.defineProperty(image, 'naturalWidth', {
        get: () => 600,
        configurable: true,
      });
      Object.defineProperty(image, 'naturalHeight', {
        get: () => 2400,
        configurable: true,
      });

      fireEvent.load(image);

      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalledWith('portrait');
      });
    });
  });

  describe('callbacks', () => {
    it('should call onImageLoad callback', async () => {
      const onImageLoad = vi.fn();

      render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={null}
          onImageLoad={onImageLoad}
        />
      );

      const image = screen.getByAltText('Test Artwork') as HTMLImageElement;
      fireEvent.load(image);

      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalled();
      });
    });

    it('should call onNextImagePreloaded callback', async () => {
      const onNextImagePreloaded = vi.fn();

      render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={mockNextArtwork}
          onNextImagePreloaded={onNextImagePreloaded}
        />
      );

      const nextImage = screen.getByAltText('Next Artwork') as HTMLImageElement;
      fireEvent.load(nextImage);

      await waitFor(() => {
        expect(onNextImagePreloaded).toHaveBeenCalled();
      });
    });

    it('should not crash if callbacks are undefined', () => {
      render(<ArtworkDisplay currentArtwork={mockArtwork} nextArtwork={null} />);

      const image = screen.getByAltText('Test Artwork') as HTMLImageElement;

      expect(() => {
        fireEvent.load(image);
      }).not.toThrow();
    });
  });

  describe('image transitions', () => {
    it('should show new image when artwork changes', async () => {
      const { rerender } = render(
        <ArtworkDisplay currentArtwork={mockArtwork} nextArtwork={null} />
      );

      expect(screen.getByAltText('Test Artwork')).toBeTruthy();

      const newArtwork: Artwork = {
        ...mockArtwork,
        objectID: 3,
        title: 'New Artwork',
        primaryImage: 'https://example.com/image3.jpg',
      };

      rerender(<ArtworkDisplay currentArtwork={newArtwork} nextArtwork={null} />);

      await waitFor(() => {
        expect(screen.getByAltText('New Artwork')).toBeTruthy();
      });
    });

    it('should reset loading state when artwork changes', async () => {
      const { rerender } = render(
        <ArtworkDisplay currentArtwork={mockArtwork} nextArtwork={null} />
      );

      const firstImage = screen.getByAltText('Test Artwork') as HTMLImageElement;
      fireEvent.load(firstImage);

      await waitFor(() => {
        const spinner = document.querySelector('.border-t-transparent');
        expect(spinner).toBeFalsy();
      });

      const newArtwork: Artwork = {
        ...mockArtwork,
        objectID: 3,
        title: 'New Artwork',
      };

      rerender(<ArtworkDisplay currentArtwork={newArtwork} nextArtwork={null} />);

      // Spinner should be visible again
      const spinner = document.querySelector('.border-t-transparent');
      expect(spinner).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={null}
          className="custom-class"
        />
      );

      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeTruthy();
    });

    it('should have proper image containment styles', () => {
      render(<ArtworkDisplay currentArtwork={mockArtwork} nextArtwork={null} />);

      const image = screen.getByAltText('Test Artwork') as HTMLImageElement;
      expect(image.className).toContain('max-w-full');
      expect(image.className).toContain('max-h-full');
      expect(image.className).toContain('object-contain');
    });

    it('should position next image off-screen', () => {
      render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={mockNextArtwork}
        />
      );

      const nextImage = screen.getByAltText('Next Artwork') as HTMLImageElement;
      expect(nextImage.style.top).toBe('-9999px');
      expect(nextImage.style.left).toBe('-9999px');
    });
  });

  describe('error handling', () => {
    it('should handle image load errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ArtworkDisplay currentArtwork={mockArtwork} nextArtwork={null} />);

      const image = screen.getByAltText('Test Artwork') as HTMLImageElement;

      expect(() => {
        fireEvent.error(image);
      }).not.toThrow();

      consoleErrorSpy.mockRestore();
    });

    it('should handle invalid image dimensions', async () => {
      const onImageLoad = vi.fn();

      render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={null}
          onImageLoad={onImageLoad}
        />
      );

      const image = screen.getByAltText('Test Artwork') as HTMLImageElement;

      // Mock invalid dimensions
      Object.defineProperty(image, 'naturalWidth', {
        get: () => 0,
        configurable: true,
      });
      Object.defineProperty(image, 'naturalHeight', {
        get: () => 0,
        configurable: true,
      });

      fireEvent.load(image);

      await waitFor(() => {
        expect(onImageLoad).toHaveBeenCalled();
      });
    });

    it('should handle missing image URL gracefully', () => {
      const artworkNoImage = { ...mockArtwork, primaryImage: '' };

      expect(() => {
        render(<ArtworkDisplay currentArtwork={artworkNoImage} nextArtwork={null} />);
      }).not.toThrow();
    });
  });

  describe('accessibility', () => {
    it('should have alt text for images', () => {
      render(<ArtworkDisplay currentArtwork={mockArtwork} nextArtwork={null} />);

      const image = screen.getByAltText('Test Artwork');
      expect(image).toBeTruthy();
    });

    it('should have descriptive alt text for next image', () => {
      render(
        <ArtworkDisplay
          currentArtwork={mockArtwork}
          nextArtwork={mockNextArtwork}
        />
      );

      const nextImage = screen.getByAltText('Next Artwork');
      expect(nextImage).toBeTruthy();
    });
  });
});
