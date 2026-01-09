export const spacing = {
  // Base spacing scale
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Screen padding
  screenHorizontal: 20,
  screenVertical: 16,

  // Component spacing
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 12,
  listItemPadding: 16,

  // Border radius
  radiusSmall: 8,
  radiusMedium: 12,
  radiusLarge: 16,
  radiusXLarge: 24,
  radiusRound: 9999,

  // Touch targets (minimum 44x44 for accessibility)
  touchTarget: 48,
  touchTargetLarge: 56,

  // Icon sizes
  iconSmall: 20,
  iconMedium: 24,
  iconLarge: 32,
  iconXLarge: 48,

  // Header
  headerHeight: 56,

  // Bottom tabs
  tabBarHeight: 70,
  tabIconSize: 28,
} as const;

export const typography = {
  // Font sizes
  fontSizeXs: 12,
  fontSizeSm: 14,
  fontSizeMd: 16,
  fontSizeLg: 18,
  fontSizeXl: 22,
  fontSizeXxl: 28,
  fontSizeTitle: 32,

  // Font weights
  fontWeightNormal: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemibold: '600' as const,
  fontWeightBold: '700' as const,

  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,
} as const;

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

