import * as FileSystem from 'expo-file-system';
import { generateUUID } from '../../utils/uuid';
import type { IStorageService, IFileInfo } from '../../domain/interfaces/IStorageService';

const ARTWORKS_DIR = 'artworks';
const THUMBNAILS_DIR = 'thumbnails';

class FileStorageServiceClass implements IStorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = FileSystem.documentDirectory ?? '';
  }

  private async ensureDirectory(dirName: string): Promise<string> {
    const dirPath = `${this.baseDir}${dirName}`;
    const dirInfo = await FileSystem.getInfoAsync(dirPath);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
    }

    return dirPath;
  }

  async saveImage(base64Data: string, filename?: string): Promise<string> {
    const dir = await this.ensureDirectory(ARTWORKS_DIR);
    const name = filename ?? `artwork_${generateUUID()}.png`;
    const filePath = `${dir}/${name}`;

    // Remove data URI prefix if present
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    await FileSystem.writeAsStringAsync(filePath, cleanBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return `${ARTWORKS_DIR}/${name}`;
  }

  async saveThumbnail(base64Data: string, filename?: string): Promise<string> {
    const dir = await this.ensureDirectory(THUMBNAILS_DIR);
    const name = filename ?? `thumb_${generateUUID()}.png`;
    const filePath = `${dir}/${name}`;

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    await FileSystem.writeAsStringAsync(filePath, cleanBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return `${THUMBNAILS_DIR}/${name}`;
  }

  async loadImage(relativePath: string): Promise<string | null> {
    try {
      const fullPath = this.getFullPath(relativePath);
      const exists = await this.imageExists(relativePath);

      if (!exists) {
        return null;
      }

      const base64 = await FileSystem.readAsStringAsync(fullPath, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  }

  async deleteImage(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(relativePath);
      const exists = await this.imageExists(relativePath);

      if (!exists) {
        return false;
      }

      await FileSystem.deleteAsync(fullPath);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  getImageUri(relativePath: string): string {
    return this.getFullPath(relativePath);
  }

  getFullPath(relativePath: string): string {
    return `${this.baseDir}${relativePath}`;
  }

  async imageExists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(relativePath);
      const info = await FileSystem.getInfoAsync(fullPath);
      return info.exists;
    } catch {
      return false;
    }
  }

  async getFileInfo(relativePath: string): Promise<IFileInfo | null> {
    try {
      const fullPath = this.getFullPath(relativePath);
      const info = await FileSystem.getInfoAsync(fullPath);

      if (!info.exists || info.isDirectory) {
        return null;
      }

      return {
        path: relativePath,
        size: info.size ?? 0,
        modificationTime: info.modificationTime ?? Date.now(),
      };
    } catch {
      return null;
    }
  }

  async cleanupOrphanedFiles(validPaths: string[]): Promise<number> {
    let cleaned = 0;

    const dirs = [ARTWORKS_DIR, THUMBNAILS_DIR];
    for (const dir of dirs) {
      try {
        const dirPath = `${this.baseDir}${dir}`;
        const dirInfo = await FileSystem.getInfoAsync(dirPath);

        if (!dirInfo.exists) continue;

        const files = await FileSystem.readDirectoryAsync(dirPath);

        for (const file of files) {
          const relativePath = `${dir}/${file}`;
          if (!validPaths.includes(relativePath)) {
            await FileSystem.deleteAsync(`${dirPath}/${file}`);
            cleaned++;
          }
        }
      } catch (error) {
        console.error(`Error cleaning directory ${dir}:`, error);
      }
    }

    return cleaned;
  }

  async getStorageUsage(): Promise<{ artworks: number; thumbnails: number; total: number }> {
    let artworksSize = 0;
    let thumbnailsSize = 0;

    try {
      const artworksDir = `${this.baseDir}${ARTWORKS_DIR}`;
      const artworksDirInfo = await FileSystem.getInfoAsync(artworksDir);
      if (artworksDirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(artworksDir);
        for (const file of files) {
          const info = await FileSystem.getInfoAsync(`${artworksDir}/${file}`);
          if (info.exists && !info.isDirectory && info.size) {
            artworksSize += info.size;
          }
        }
      }
    } catch (error) {
      console.error('Error calculating artworks size:', error);
    }

    try {
      const thumbnailsDir = `${this.baseDir}${THUMBNAILS_DIR}`;
      const thumbnailsDirInfo = await FileSystem.getInfoAsync(thumbnailsDir);
      if (thumbnailsDirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(thumbnailsDir);
        for (const file of files) {
          const info = await FileSystem.getInfoAsync(`${thumbnailsDir}/${file}`);
          if (info.exists && !info.isDirectory && info.size) {
            thumbnailsSize += info.size;
          }
        }
      }
    } catch (error) {
      console.error('Error calculating thumbnails size:', error);
    }

    return {
      artworks: artworksSize,
      thumbnails: thumbnailsSize,
      total: artworksSize + thumbnailsSize,
    };
  }
}

export const FileStorageService = new FileStorageServiceClass();

