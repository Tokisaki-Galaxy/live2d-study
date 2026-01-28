import { Live2DModel } from "pixi-live2d-display";
import * as PIXI from "pixi.js";
import JSZip from "jszip";

// Expose PIXI to window for pixi-live2d-display
window.PIXI = PIXI;

export class Live2DLoader {
  private static blobUrls: string[] = [];

  /**
   * Cleans up all generated Blob URLs to prevent memory leaks
   */
  static cleanup() {
    this.blobUrls.forEach((url) => URL.revokeObjectURL(url));
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
   * Loads a generic Live2D generic model or lpk from a zip file (blob)
   */
  static async loadModelFromZip(zipBlob: Blob): Promise<Live2DModel | null> {
    try {
      this.cleanup(); // Clean up previous resources

      const zip = await JSZip.loadAsync(zipBlob);
      const files: Record<string, Blob> = {};

      // 1. Unzip and find entry point
      const filePaths = Object.keys(zip.files);

      // Filter out directories and MacOS/system garbage
      const validFilePaths = filePaths.filter(
        (path) =>
          !zip.files[path].dir &&
          !path.includes("__MACOSX") &&
          !path.includes(".DS_Store"),
      );

      // Heuristic to find the main model json file
      const modelJsonPath = validFilePaths.find(
        (path) => path.endsWith("model3.json") || path.endsWith("model.json"),
      );

      if (!modelJsonPath) {
        throw new Error(
          "No model3.json or model.json found in the zip archive",
        );
      }

      // 2. Extract all files to Blobs and mapped paths
      // We need to maintain relative directory structure for resources
      const rootDir = modelJsonPath.substring(
        0,
        modelJsonPath.lastIndexOf("/") + 1,
      );

      await Promise.all(
        validFilePaths.map(async (path) => {
          const fileData = await zip.files[path].async("blob");

          // Remove root directory prefix if it exists to normalize paths
          // But honestly, the cleanest way is just to keep the full path key
          // and let the interceptor handle relative resolution.

          // However, pixi-live2d-display expects us to feed it a setting that handles file access.
          // A better approach for the library is to replace the file paths in the JSON
          // with Blob URLs directly, but that's complex for binary references (moc3).

          // Strategy: Create a flat map of "filename" -> "Blob URL"
          // AND "full/path/filename" -> "Blob URL"
          // This is tricky.

          // Better Strategy: Use a custom file loader for the model
          // but pixi-live2d-display doesn't expose that easily.

          // Workaround: We will overwrite the XHR/fetch globally? No, too dangerous.
          // We will "Patch" the model JSON content directly.

          files[path] = fileData;
        }),
      );

      // 3. Process the Entry JSON
      const modelJsonContent = await zip.files[modelJsonPath].async("string");
      const modelConfig = JSON.parse(modelJsonContent);

      const getBlobUrlForPath = async (relativePath: string) => {
        // Resolve relative path against rootDir
        // e.g. rootDir = "Haru/", relativePath = "motions/idle.motion3.json"
        // target = "Haru/motions/idle.motion3.json"

        // Simple resolution: Handle ./ or just strings
        const cleanRelative = relativePath.startsWith("./")
          ? relativePath.substring(2)
          : relativePath;
        const fullPath = rootDir + cleanRelative;

        // Find exact match
        if (files[fullPath]) {
          const blob = files[fullPath];
          // Determine mime type based on extension
          let mimeType = "application/octet-stream";
          if (fullPath.endsWith(".json")) mimeType = "application/json";
          if (fullPath.endsWith(".png")) mimeType = "image/png";

          const typedBlob = new Blob([blob], { type: mimeType });
          const url = URL.createObjectURL(typedBlob);
          this.registerUrl(url);
          return url;
        }

        console.warn(`File not found in zip: ${fullPath} (Root: ${rootDir})`);
        return relativePath; // Fallback
      };

      // 4. Recursively replace known fields in the JSON
      // Live2D model3.json structure involves:
      // FileReferences: { Moc: "", Textures: [], Physics: "", Motions: { Group: [ { File: "" } ] } }

      if (modelConfig.FileReferences) {
        const refs = modelConfig.FileReferences;

        if (refs.Moc) refs.Moc = await getBlobUrlForPath(refs.Moc);

        if (refs.Textures && Array.isArray(refs.Textures)) {
          for (let i = 0; i < refs.Textures.length; i++) {
            refs.Textures[i] = await getBlobUrlForPath(refs.Textures[i]);
          }
        }

        if (refs.Physics) refs.Physics = await getBlobUrlForPath(refs.Physics);

        if (refs.Motions) {
          for (const groupKey in refs.Motions) {
            const group = refs.Motions[groupKey];
            if (Array.isArray(group)) {
              for (const motion of group) {
                if (motion.File) {
                  motion.File = await getBlobUrlForPath(motion.File);
                }
              }
            }
          }
        }
      }

      // Recreate the main JSON as a Blob URL
      const patchedConfigStr = JSON.stringify(modelConfig);
      const configBlob = new Blob([patchedConfigStr], {
        type: "application/json",
      });
      const configUrl = URL.createObjectURL(configBlob);
      this.registerUrl(configUrl);

      // 5. Load model using the patched config URL
      const model = await Live2DModel.from(configUrl);
      return model;
    } catch (e) {
      console.error("Failed to load Live2D model from zip", e);
      throw e;
    }
  }
}
