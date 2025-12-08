const BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

// Départements sélectionnés pour une variété d'œuvres visuelles
const DEFAULT_DEPARTMENTS = [
  11, // European Paintings
  21, // Modern Art
  19, // Photographs
  6,  // Asian Art
  9,  // Drawings and Prints
  1,  // American Decorative Arts
];

export interface Artwork {
  objectID: number;
  title: string;
  artistDisplayName: string;
  primaryImage: string;
  lowResImage?: string;
  medium: string;
  dimensions: string;
  department: string;
  objectDate: string;
}

export type GalleryMode = 'exploration' | 'masterpieces';

class MetMuseumService {
  private objectIds: number[] = [];
  private initialized = false;
  private cache = new Map<number, Artwork>();
  private usedIds = new Set<number>();
  private departments: number[] = DEFAULT_DEPARTMENTS;
  private mode: GalleryMode = 'exploration';

  // Getters publics pour exposer l'état
  get isInitialized(): boolean {
    return this.initialized;
  }

  get availableArtworksCount(): number {
    return this.objectIds.length;
  }

  get cachedArtworksCount(): number {
    return this.cache.size;
  }

  get currentMode(): GalleryMode {
    return this.mode;
  }

  /**
   * Configure les départements à utiliser
   * @param departmentIds - Liste des IDs de départements
   */
  setDepartments(departmentIds: number[]): void {
    if (this.initialized) {
      throw new Error('Cannot change departments after initialization');
    }
    this.departments = departmentIds;
  }

  /**
   * Configure le mode de la galerie
   * @param mode - 'exploration' (189K œuvres) ou 'masterpieces' (2,7K highlights)
   */
  setMode(mode: GalleryMode): void {
    // Si le mode change après initialisation, on reset
    if (this.initialized && this.mode !== mode) {
      console.log(`🔄 Mode change detected: ${this.mode} -> ${mode}`);
      this.reset();
    }
    this.mode = mode;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const modeLabel = this.mode === 'exploration' ? '🌍 Exploration Libre' : '⭐ Chefs-d\'Œuvre';
      const isHighlight = this.mode === 'masterpieces';

      let allObjectIds: number[] = [];

      if (isHighlight) {
        // Mode masterpieces: récupérer TOUS les highlights sans filtre de département
        console.log(`${modeLabel} - Fetching all highlights globally...`);

        try {
          const response = await fetch(
            `${BASE_URL}/search?hasImages=true&isHighlight=true&q=*`
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();

          if (data.objectIDs && data.objectIDs.length > 0) {
            allObjectIds = data.objectIDs;
            console.log(`   ✅ Global highlights: ${data.objectIDs.length.toLocaleString()} objects`);
          }
        } catch (error) {
          console.error('⚠️  Failed to fetch highlights:', error);
          throw error;
        }
      } else {
        // Mode exploration: récupérer par département pour plus de variété
        console.log(`${modeLabel} - Initializing with ${this.departments.length} departments...`);

        for (const deptId of this.departments) {
          try {
            const response = await fetch(
              `${BASE_URL}/search?hasImages=true&departmentId=${deptId}&q=*`
            );

            if (!response.ok) {
              console.warn(`⚠️  Department ${deptId}: HTTP ${response.status}`);
              continue;
            }

            const data = await response.json();

            if (data.objectIDs && data.objectIDs.length > 0) {
              allObjectIds.push(...data.objectIDs);
              console.log(`   ✅ Dept ${deptId}: ${data.objectIDs.length.toLocaleString()} objects`);
            }
          } catch (error) {
            console.warn(`⚠️  Department ${deptId} failed:`, error);
            // Continue avec les autres départements
          }
        }
      }

      if (allObjectIds.length === 0) {
        throw new Error('No objects with images found');
      }

      // Dédupliquer les IDs (un objet peut être dans plusieurs départements)
      const uniqueIds = [...new Set(allObjectIds)];

      console.log(`✅ ${modeLabel}: ${uniqueIds.length.toLocaleString()} unique artworks`);

      // Mélanger pour avoir un ordre aléatoire
      this.objectIds = this.shuffleArray(uniqueIds);
      this.initialized = true;

      console.log(`🎲 Ready to display random artworks!`);
    } catch (error) {
      console.error('❌ Failed to initialize Met Museum API:', error);
      throw error;
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async getRandomArtwork(): Promise<Artwork | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.objectIds.length === 0) {
      return null;
    }

    // Try cached artwork first if available
    const cachedArtwork = this.getCachedArtwork();
    if (cachedArtwork) {
      // Preload next artworks in background
      this.preloadNext(2);
      return cachedArtwork;
    }

    // Fetch new artwork with retry logic
    return this.fetchRandomArtworkWithRetry(3);
  }

  private getCachedArtwork(): Artwork | null {
    const cachedIds = Array.from(this.cache.keys()).filter(id => !this.usedIds.has(id));
    if (cachedIds.length > 0) {
      const randomCachedId = cachedIds[Math.floor(Math.random() * cachedIds.length)];
      const artwork = this.cache.get(randomCachedId);
      if (artwork) {
        this.usedIds.add(randomCachedId);
        return artwork;
      }
    }
    return null;
  }

  private async fetchRandomArtworkWithRetry(maxRetries: number): Promise<Artwork | null> {
    let retries = 0;
    const attemptedIds = new Set<number>();

    while (retries < maxRetries && attemptedIds.size < this.objectIds.length) {
      try {
        // Get unused random object ID
        let randomIndex: number;
        let objectId: number;
        
        do {
          randomIndex = Math.floor(Math.random() * this.objectIds.length);
          objectId = this.objectIds[randomIndex];
        } while (attemptedIds.has(objectId) && attemptedIds.size < this.objectIds.length);
        
        attemptedIds.add(objectId);

        const artwork = await this.fetchArtwork(objectId);
        
        if (artwork && artwork.primaryImage && artwork.title) {
          // Cache the artwork and mark as used
          this.cache.set(objectId, artwork);
          this.usedIds.add(objectId);
          
          // Preload next artworks in background
          this.preloadNext(2);
          
          return artwork;
        }
      } catch (error) {
        console.warn(`Retry ${retries + 1}/${maxRetries}:`, error);
      }
      
      retries++;
    }

    // If we've used all artworks, reset the used set
    if (this.usedIds.size >= this.objectIds.length) {
      this.usedIds.clear();
      console.log('Resetting artwork pool - all artworks have been shown');
    }
    
    return null;
  }

  private async fetchArtwork(objectId: number): Promise<Artwork | null> {
    const response = await fetch(`${BASE_URL}/objects/${objectId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const artwork = await response.json();

    if (!artwork.primaryImage || !artwork.title) {
      return null;
    }

    // Generate low-res version for progressive loading
    const lowResImage = artwork.primaryImage.replace('/original/', '/web-large/');

    return {
      objectID: artwork.objectID,
      title: artwork.title || 'Untitled',
      artistDisplayName: artwork.artistDisplayName || 'Unknown Artist',
      primaryImage: artwork.primaryImage,
      lowResImage: lowResImage !== artwork.primaryImage ? lowResImage : undefined,
      medium: artwork.medium || 'Unknown Medium',
      dimensions: artwork.dimensions || 'Unknown Dimensions',
      department: artwork.department || 'Unknown Department',
      objectDate: artwork.objectDate || 'Unknown Date',
    };
  }

  private async preloadNext(count: number): Promise<void> {
    // Run in background without blocking
    setTimeout(async () => {
      let preloaded = 0;
      let attempts = 0;
      const maxAttempts = count * 2;

      while (preloaded < count && attempts < maxAttempts) {
        try {
          const randomIndex = Math.floor(Math.random() * this.objectIds.length);
          const objectId = this.objectIds[randomIndex];
          
          if (!this.cache.has(objectId) && !this.usedIds.has(objectId)) {
            const artwork = await this.fetchArtwork(objectId);
            if (artwork) {
              this.cache.set(objectId, artwork);
              preloaded++;
            }
          }
        } catch (error) {
          // Silent fail for preloading
        }
        attempts++;
      }
    }, 100);
  }

  // Reset cache when needed
  clearCache(): void {
    this.cache.clear();
    this.usedIds.clear();
  }

  // Reset complet du service (pour changement de mode)
  private reset(): void {
    this.objectIds = [];
    this.initialized = false;
    this.cache.clear();
    this.usedIds.clear();
  }

  // Précharger plusieurs œuvres au démarrage
  async preloadInitialArtworks(count: number = 3): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      let preloaded = 0;
      let attempts = 0;
      const maxAttempts = count * 3;

      const preloadOne = async () => {
        if (preloaded >= count || attempts >= maxAttempts) {
          resolve();
          return;
        }

        attempts++;

        try {
          const randomIndex = Math.floor(Math.random() * this.objectIds.length);
          const objectId = this.objectIds[randomIndex];

          if (!this.cache.has(objectId)) {
            const artwork = await this.fetchArtwork(objectId);
            if (artwork) {
              this.cache.set(objectId, artwork);
              preloaded++;
            }
          }
        } catch (error) {
          // Silent fail for preloading
        }

        // Continue preloading
        preloadOne();
      };

      // Start preloading
      preloadOne();
    });
  }
}

export const metMuseumService = new MetMuseumService();