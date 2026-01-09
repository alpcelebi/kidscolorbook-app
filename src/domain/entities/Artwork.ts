export type ArtworkType = 'coloring' | 'freedraw';

export interface Artwork {
  id: string;
  type: ArtworkType;
  name: string;
  pageId?: string; // Only for coloring type
  drawingData: string; // Serialized path data JSON
  thumbnailPath?: string;
  imagePath?: string; // Exported PNG path
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ArtworkCreateInput {
  type: ArtworkType;
  name: string;
  pageId?: string;
  drawingData: string;
}

export interface ArtworkUpdateInput {
  name?: string;
  drawingData?: string;
  thumbnailPath?: string;
  imagePath?: string;
  isFavorite?: boolean;
}

