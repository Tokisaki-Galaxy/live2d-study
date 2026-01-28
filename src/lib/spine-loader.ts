import * as PIXI from 'pixi.js';
import { Spine } from 'pixi-spine';
import JSZip from 'jszip';

// Expose PIXI to window for pixi-spine
(window as any).PIXI = PIXI;

export class SpineLoader {
  private static blobUrls: string[] = [];
  
  /**
   * Cleans up all generated Blob URLs to prevent memory leaks
   */
  static cleanup() {
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls = [];
  }

  /**
   * Registers a Blob URL for later cleanup
   */
  private static registerUrl(url: string) {
    this.blobUrls.push(url);
    return url;
  }

  /**
   * Loads a Spine model from a zip file (blob)
   * Supports .json/.skel + .atlas + texture files
   */
  static async loadSpineFromZip(zipBlob: Blob): Promise<Spine | null> {
    try {
      this.cleanup(); // Clean up previous resources
      
      const zip = await JSZip.loadAsync(zipBlob);
      const files: Record<string, Blob> = {};
      
      // 1. Unzip all files
      const filePaths = Object.keys(zip.files);
      
      // Filter out directories and MacOS/system garbage
      const validFilePaths = filePaths.filter(path => 
        !zip.files[path].dir && 
        !path.includes('__MACOSX') && 
        !path.includes('.DS_Store')
      );

      // Find the atlas file (.atlas or .atlas.txt)
      const atlasPath = validFilePaths.find(path => 
        path.endsWith('.atlas') || path.endsWith('.atlas.txt')
      );

      // Find the skeleton file (.json or .skel)
      const skeletonPath = validFilePaths.find(path => 
        path.endsWith('.json') && !path.endsWith('.atlas.json') ||
        path.endsWith('.skel')
      );

      if (!atlasPath) {
        throw new Error('No .atlas file found in the zip archive');
      }

      if (!skeletonPath) {
        throw new Error('No skeleton .json or .skel file found in the zip archive');
      }

      // 2. Extract all files to Blobs
      await Promise.all(validFilePaths.map(async (path) => {
        const fileData = await zip.files[path].async('blob');
        files[path] = fileData;
      }));

      // 3. Read atlas and skeleton content
      const atlasContent = await zip.files[atlasPath].async('string');
      
      // Parse atlas to find texture files
      const textureNames = this.parseAtlasForTextures(atlasContent);
      
      // 4. Create resource URLs for textures
      const textureUrls: Record<string, string> = {};
      for (const textureName of textureNames) {
        // Try to find the texture file in the zip
        const texturePath = validFilePaths.find(path => 
          path.endsWith(textureName) || path.includes(textureName)
        );
        
        if (texturePath && files[texturePath]) {
          const blob = files[texturePath];
          let mimeType = 'image/png';
          if (texturePath.endsWith('.jpg') || texturePath.endsWith('.jpeg')) {
            mimeType = 'image/jpeg';
          }
          
          const typedBlob = new Blob([blob], { type: mimeType });
          const url = URL.createObjectURL(typedBlob);
          this.registerUrl(url);
          textureUrls[textureName] = url;
        }
      }

      // 5. Create Spine instance using PIXI's loader
      // We need to manually create resources for the loader
      const loader = new PIXI.Loader();
      
      // Add atlas resource
      const atlasBlob = new Blob([atlasContent], { type: 'text/plain' });
      const atlasUrl = URL.createObjectURL(atlasBlob);
      this.registerUrl(atlasUrl);
      
      // Add skeleton resource
      const skeletonData = await zip.files[skeletonPath].async('arraybuffer');
      const skeletonBlob = new Blob([skeletonData], { 
        type: skeletonPath.endsWith('.json') ? 'application/json' : 'application/octet-stream' 
      });
      const skeletonUrl = URL.createObjectURL(skeletonBlob);
      this.registerUrl(skeletonUrl);
      
      // Load resources
      return new Promise((resolve, reject) => {
        // Pre-load textures
        const textureLoader = new PIXI.Loader();
        const textureResources = Object.entries(textureUrls).map(([name, url]) => ({
          name,
          url
        }));
        
        if (textureResources.length > 0) {
          textureResources.forEach(({ name, url }) => {
            textureLoader.add(name, url);
          });
        }
        
        textureLoader.load(() => {
          // Now load spine with the atlas
          loader.add('spineData', skeletonUrl, {
            metadata: {
              spineAtlasFile: atlasUrl,
              // Provide image loader that uses our pre-loaded textures
              imageLoader: (_loaderParam: any, resource: any, resolveTexture: any) => {
                const texture = textureLoader.resources[resource.name]?.texture;
                if (texture) {
                  resolveTexture(texture.baseTexture);
                } else {
                  reject(new Error(`Texture ${resource.name} not found`));
                }
              }
            }
          });
          
          loader.load((_loaderParam, resources) => {
            if (resources.spineData && resources.spineData.spineData) {
              const spine = new Spine(resources.spineData.spineData);
              resolve(spine);
            } else {
              reject(new Error('Failed to load Spine data'));
            }
          });
        });
        
        textureLoader.onError.add((error) => {
          reject(error);
        });
        
        loader.onError.add((error) => {
          reject(error);
        });
      });

    } catch (e) {
      console.error('Failed to load Spine model from zip', e);
      throw e;
    }
  }
  
  /**
   * Parse atlas file content to extract texture filenames
   */
  private static parseAtlasForTextures(atlasContent: string): string[] {
    const lines = atlasContent.split('\n');
    const textures: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Texture filenames appear on their own line
      // They typically end with .png or .jpg
      if (line && !line.includes(':') && (line.endsWith('.png') || line.endsWith('.jpg') || line.endsWith('.jpeg'))) {
        textures.push(line);
      }
    }
    
    return textures;
  }
}
