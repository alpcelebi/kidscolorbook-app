// SVG Registry - DEPRECATED
// This file is kept for backwards compatibility but is no longer used.
// The app now uses PNG images only for better quality.
// See pngRegistry.ts for the active image registry.

import React from 'react';
import { SvgProps } from 'react-native-svg';

type SvgComponent = React.FC<SvgProps>;

// Empty registry - all pages now use PNG
const svgRegistry: Record<string, SvgComponent> = {};

export const getSvgComponent = (svgPath: string): SvgComponent | null => {
  return svgRegistry[svgPath] || null;
};

export const hasSvg = (svgPath: string): boolean => {
  return svgPath in svgRegistry;
};
