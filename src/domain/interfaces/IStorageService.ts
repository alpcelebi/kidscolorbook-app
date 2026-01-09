export interface IStorageService {
  saveImage(data: string, filename: string): Promise<string>;
  loadImage(path: string): Promise<string | null>;
  deleteImage(path: string): Promise<boolean>;
  getImageUri(path: string): string;
  imageExists(path: string): Promise<boolean>;
}

export interface IFileInfo {
  path: string;
  size: number;
  modificationTime: number;
}

