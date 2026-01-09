export interface Page {
  id: string;
  categoryId: string;
  nameKey: string; // i18n key for the page name
  svgPath: string; // Path to bundled SVG asset
  thumbnailPath?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PageProgress {
  id: string;
  pageId: string;
  drawingData: string; // Serialized path data JSON
  lastModified: number;
  completed: boolean;
}

export interface PageWithProgress extends Page {
  progress?: PageProgress;
  isFavorite: boolean;
}

