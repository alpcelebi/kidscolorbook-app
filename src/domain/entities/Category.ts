export interface Category {
  id: string;
  nameKey: string; // i18n key for the category name
  iconName: string; // Icon identifier
  order: number;
  createdAt: number;
}

export interface CategoryWithPages extends Category {
  pageCount: number;
  completedCount: number;
}

