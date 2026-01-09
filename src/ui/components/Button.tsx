import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, typography, shadows } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

function ButtonComponent({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[`${variant}Container`],
    styles[`${size}Container`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    variant === 'primary' && !isDisabled && shadows.small,
    style,
  ];

  const labelStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.textOnPrimary : colors.primary}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={labelStyle}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radiusMedium,
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },

  // Variants
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.secondary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },

  // Sizes
  smallContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  mediumContainer: {
    paddingVertical: spacing.buttonPadding,
    paddingHorizontal: spacing.lg,
    minHeight: spacing.touchTarget,
  },
  largeContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: spacing.touchTargetLarge,
  },

  // Disabled
  disabled: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.disabled,
  },

  // Text base
  text: {
    fontWeight: typography.fontWeightSemibold,
    textAlign: 'center',
  },

  // Text variants
  primaryText: {
    color: colors.textOnPrimary,
  },
  secondaryText: {
    color: colors.textOnSecondary,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.primary,
  },

  // Text sizes
  smallText: {
    fontSize: typography.fontSizeSm,
  },
  mediumText: {
    fontSize: typography.fontSizeMd,
  },
  largeText: {
    fontSize: typography.fontSizeLg,
  },

  disabledText: {
    color: colors.disabled,
  },
});

export const Button = memo(ButtonComponent);

