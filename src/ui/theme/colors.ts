export const colors = {
  // Primary
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E64545',

  // Secondary
  secondary: '#4ECDC4',
  secondaryLight: '#7EDED7',
  secondaryDark: '#2BB8AD',

  // Accent
  accent: '#FFE66D',
  accentLight: '#FFF0A1',
  accentDark: '#FFD93D',

  // Background
  background: '#FFF9F0',
  backgroundLight: '#FFFFFF',
  surface: '#FFFFFF',

  // Text
  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#00B894',
  successLight: '#E8F8F4',
  warning: '#FDCB6E',
  warningLight: '#FEF6E4',
  error: '#FF7675',
  errorLight: '#FFE6E6',
  info: '#74B9FF',
  infoLight: '#E8F4FF',

  // Borders
  border: '#DFE6E9',
  borderLight: '#F1F3F4',

  // Misc
  disabled: '#B2BEC3',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Canvas
  canvasBackground: '#FFFFFF',
  canvasBorder: '#E0E0E0',

  // Categories (kid-friendly colors)
  categoryAnimals: '#FFB74D',
  categoryVehicles: '#64B5F6',
  categoryNature: '#81C784',
  categoryShapes: '#BA68C8',
  categoryDinosaurs: '#A1887F',
  categorySea: '#4DD0E1',
  categorySpace: '#7986CB',
  categoryFood: '#F06292',
  categoryFruits: '#FFCC80',
  categoryFantasy: '#B39DDB',

  // Additional palette for extended features
  palette: {
    red: '#FF0000',
    orange: '#FF6B00',
    yellow: '#FFD700',
    green: '#00C853',
    cyan: '#00BCD4',
    blue: '#2196F3',
    purple: '#9C27B0',
    pink: '#E91E63',
    brown: '#795548',
    black: '#000000',
    gray: '#9E9E9E',
    white: '#FFFFFF',
  },

  // Progress colors
  progressBackground: '#E8E8E8',
  progressFill: '#4ECDC4',
};

export type ColorName = keyof typeof colors;

// Category color mapping
const categoryColorMap: Record<string, string> = {
  'cat-animals': colors.categoryAnimals,
  'cat-vehicles': colors.categoryVehicles,
  'cat-nature': colors.categoryNature,
  'cat-shapes': colors.categoryShapes,
  'cat-dinosaurs': colors.categoryDinosaurs,
  'cat-sea': colors.categorySea,
  'cat-space': colors.categorySpace,
  'cat-food': colors.categoryFood,
  'cat-fruits': colors.categoryFruits,
  'cat-fantasy': colors.categoryFantasy,
  animals: colors.categoryAnimals,
  vehicles: colors.categoryVehicles,
  nature: colors.categoryNature,
  shapes: colors.categoryShapes,
  dinosaurs: colors.categoryDinosaurs,
  sea: colors.categorySea,
  space: colors.categorySpace,
  food: colors.categoryFood,
  fruits: colors.categoryFruits,
  fantasy: colors.categoryFantasy,
};

export const getCategoryColor = (categoryId: string): string => {
  return categoryColorMap[categoryId] || colors.primary;
};
