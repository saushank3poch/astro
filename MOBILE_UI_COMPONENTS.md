# Mobile UI Components Specification

## Overview
This document defines all mobile UI components, design system, and platform-specific considerations for the Astro mobile app. Components follow a consistent design language across iOS and Android while respecting platform conventions.

---

## Table of Contents
1. [Design System](#design-system)
2. [Base UI Components](#base-ui-components)
3. [Feature-Specific Components](#feature-specific-components)
4. [Animation Requirements](#animation-requirements)
5. [Reusable Patterns](#reusable-patterns)
6. [Platform Differences](#platform-differences)

---

## Design System

### Color Palette

```typescript
// constants/Colors.ts
export const Colors = {
  // Primary colors
  primary: {
    main: '#7C3AED',      // Purple - main brand
    light: '#A78BFA',     // Light purple
    dark: '#5B21B6',      // Dark purple
    contrast: '#FFFFFF',  // White text on purple
  },

  // Secondary colors
  secondary: {
    main: '#F59E0B',      // Amber - accents
    light: '#FCD34D',     // Light amber
    dark: '#D97706',      // Dark amber
    contrast: '#1F2937',  // Dark text on amber
  },

  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray100: '#F3F4F6',   // Lightest gray
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',   // Medium gray
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',   // Darkest gray
  },

  // Semantic colors
  success: {
    main: '#10B981',      // Green
    light: '#6EE7B7',
    dark: '#047857',
    bg: '#D1FAE5',        // Light green background
  },

  error: {
    main: '#EF4444',      // Red
    light: '#FCA5A5',
    dark: '#B91C1C',
    bg: '#FEE2E2',        // Light red background
  },

  warning: {
    main: '#F59E0B',      // Orange
    light: '#FCD34D',
    dark: '#D97706',
    bg: '#FEF3C7',        // Light orange background
  },

  info: {
    main: '#3B82F6',      // Blue
    light: '#93C5FD',
    dark: '#1D4ED8',
    bg: '#DBEAFE',        // Light blue background
  },

  // Element colors (Chinese astrology)
  elements: {
    fire: '#EF4444',      // Red
    earth: '#92400E',     // Brown
    metal: '#D1D5DB',     // Silver/Gray
    water: '#3B82F6',     // Blue
    wood: '#10B981',      // Green
  },

  // Background colors
  background: {
    primary: '#FFFFFF',   // White (light mode)
    secondary: '#F9FAFB', // Light gray
    tertiary: '#F3F4F6',  // Lighter gray
  },

  // Dark mode (optional for Phase 1)
  dark: {
    background: {
      primary: '#111827',
      secondary: '#1F2937',
      tertiary: '#374151',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
    },
  },
};
```

### Typography

```typescript
// constants/Typography.ts
export const Typography = {
  // Font families
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
    }),
    serif: Platform.select({
      ios: 'Georgia',
      android: 'serif',
    }),
  },

  // Font sizes
  fontSize: {
    xs: 12,    // Captions, footnotes
    sm: 14,    // Secondary text
    base: 16,  // Body text (default)
    lg: 18,    // Emphasized text
    xl: 20,    // Headings (small)
    '2xl': 24, // Headings (medium)
    '3xl': 30, // Headings (large)
    '4xl': 36, // Display text
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Predefined text styles
export const TextStyles = {
  h1: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize['3xl'],
  },
  h2: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize['2xl'],
  },
  h3: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize.xl,
  },
  body: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
  },
  bodyBold: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
  },
  caption: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  button: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize.base,
  },
};
```

### Spacing

```typescript
// constants/Layout.ts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999, // For circular elements
};

export const Layout = {
  screenPadding: Spacing.md, // 16px
  cardPadding: Spacing.md,   // 16px
  sectionSpacing: Spacing.lg, // 24px
};
```

### Shadows

```typescript
// constants/Shadows.ts
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // Android
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

---

## Base UI Components

### Button

```typescript
// components/ui/Button.tsx
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const styles = getButtonStyles(variant, size, disabled, fullWidth);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={styles.text.color} />
      ) : (
        <>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// Styles
const getButtonStyles = (variant, size, disabled, fullWidth) => {
  const baseContainer = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    opacity: disabled ? 0.5 : 1,
    ...(fullWidth && { width: '100%' }),
  };

  const sizes = {
    sm: { paddingVertical: 8, paddingHorizontal: 16 },
    md: { paddingVertical: 12, paddingHorizontal: 24 },
    lg: { paddingVertical: 16, paddingHorizontal: 32 },
  };

  const variants = {
    primary: {
      container: { ...baseContainer, ...sizes[size], backgroundColor: Colors.primary.main },
      text: { ...TextStyles.button, color: Colors.primary.contrast },
    },
    secondary: {
      container: { ...baseContainer, ...sizes[size], backgroundColor: Colors.secondary.main },
      text: { ...TextStyles.button, color: Colors.secondary.contrast },
    },
    outline: {
      container: {
        ...baseContainer,
        ...sizes[size],
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary.main
      },
      text: { ...TextStyles.button, color: Colors.primary.main },
    },
    ghost: {
      container: { ...baseContainer, ...sizes[size], backgroundColor: 'transparent' },
      text: { ...TextStyles.button, color: Colors.primary.main },
    },
  };

  return variants[variant];
};
```

### Input

```typescript
// components/ui/Input.tsx
import { TextInput, View, Text } from 'react-native';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  leftIcon,
  rightIcon,
}: InputProps) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      {label && (
        <Text style={[TextStyles.caption, { marginBottom: Spacing.xs, color: Colors.neutral.gray700 }]}>
          {label}
        </Text>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.neutral.gray100,
          borderRadius: BorderRadius.md,
          borderWidth: 1,
          borderColor: error ? Colors.error.main : Colors.neutral.gray300,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
        }}
      >
        {leftIcon && <View style={{ marginRight: Spacing.sm }}>{leftIcon}</View>}

        <TextInput
          style={{
            flex: 1,
            ...TextStyles.body,
            color: Colors.neutral.gray900,
          }}
          placeholder={placeholder}
          placeholderTextColor={Colors.neutral.gray400}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
        />

        {rightIcon && <View style={{ marginLeft: Spacing.sm }}>{rightIcon}</View>}
      </View>

      {error && (
        <Text style={[TextStyles.caption, { marginTop: Spacing.xs, color: Colors.error.main }]}>
          {error}
        </Text>
      )}
    </View>
  );
}
```

### Card

```typescript
// components/ui/Card.tsx
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

export function Card({
  children,
  style,
  padding = Spacing.md,
  shadow = 'md',
  onPress,
}: CardProps) {
  const shadowStyle = shadow !== 'none' ? Shadows[shadow] : {};

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        {
          backgroundColor: Colors.background.primary,
          borderRadius: BorderRadius.lg,
          padding,
          ...shadowStyle,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
}
```

### Modal

```typescript
// components/ui/Modal.tsx
import { Modal as RNModal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function Modal({ visible, onClose, title, children, size = 'md' }: ModalProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { maxHeight: '40%' };
      case 'md': return { maxHeight: '60%' };
      case 'lg': return { maxHeight: '80%' };
      case 'full': return { height: '100%' };
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.md }}>
        <View
          style={{
            backgroundColor: Colors.background.primary,
            borderRadius: BorderRadius.xl,
            padding: Spacing.lg,
            ...Shadows.xl,
            ...getSizeStyles(),
          }}
        >
          {/* Header */}
          {title && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
              <Text style={TextStyles.h3}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={Colors.neutral.gray700} />
              </TouchableOpacity>
            </View>
          )}

          {/* Content */}
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
}
```

### Spinner/Loading

```typescript
// components/ui/Spinner.tsx
import { ActivityIndicator, View, Text } from 'react-native';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

export function Spinner({ size = 'large', color = Colors.primary.main, text }: SpinnerProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[TextStyles.body, { marginTop: Spacing.md, color: Colors.neutral.gray600 }]}>
          {text}
        </Text>
      )}
    </View>
  );
}
```

### Toast/Snackbar

```typescript
// components/ui/Toast.tsx
import { View, Text, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 3000
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(onHide);
    }
  }, [visible]);

  if (!visible) return null;

  const colors = {
    success: Colors.success,
    error: Colors.error,
    warning: Colors.warning,
    info: Colors.info,
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 100,
        left: Spacing.md,
        right: Spacing.md,
        backgroundColor: colors[type].main,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        opacity,
        ...Shadows.lg,
      }}
    >
      <Text style={[TextStyles.body, { color: 'white' }]}>{message}</Text>
    </Animated.View>
  );
}
```

---

## Feature-Specific Components

### PredictionCard

```typescript
// components/predictions/PredictionCard.tsx
interface PredictionCardProps {
  prediction: {
    id: string;
    asset: string;
    type: 'macro' | 'timing' | 'divination';
    result: string;
    compatibilityScore: number;
    createdAt: Date;
  };
  onPress?: () => void;
}

export function PredictionCard({ prediction, onPress }: PredictionCardProps) {
  return (
    <Card onPress={onPress} shadow="md">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
        <Text style={TextStyles.h3}>{prediction.asset}</Text>
        <View style={{
          backgroundColor: getTypeColor(prediction.type),
          paddingHorizontal: Spacing.sm,
          paddingVertical: 4,
          borderRadius: BorderRadius.sm
        }}>
          <Text style={[TextStyles.caption, { color: 'white' }]}>
            {prediction.type.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={[TextStyles.body, { marginBottom: Spacing.md }]} numberOfLines={2}>
        {prediction.result}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <CompatibilityMeter score={prediction.compatibilityScore} size="sm" />
        <Text style={[TextStyles.caption, { color: Colors.neutral.gray500 }]}>
          {formatDate(prediction.createdAt)}
        </Text>
      </View>
    </Card>
  );
}

function getTypeColor(type: string) {
  const colors = {
    macro: Colors.primary.main,
    timing: Colors.secondary.main,
    divination: Colors.info.main,
  };
  return colors[type] || Colors.neutral.gray500;
}
```

### CompatibilityMeter

```typescript
// components/compatibility/CompatibilityMeter.tsx
interface CompatibilityMeterProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CompatibilityMeter({
  score,
  size = 'md',
  showLabel = true
}: CompatibilityMeterProps) {
  const sizes = {
    sm: { width: 60, height: 60, fontSize: Typography.fontSize.sm },
    md: { width: 80, height: 80, fontSize: Typography.fontSize.base },
    lg: { width: 100, height: 100, fontSize: Typography.fontSize.xl },
  };

  const getColor = (score: number) => {
    if (score >= 80) return Colors.success.main;
    if (score >= 60) return Colors.info.main;
    if (score >= 40) return Colors.warning.main;
    return Colors.error.main;
  };

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Circular progress */}
      <View
        style={{
          width: sizes[size].width,
          height: sizes[size].height,
          borderRadius: sizes[size].width / 2,
          backgroundColor: Colors.neutral.gray200,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 4,
          borderColor: getColor(score),
        }}
      >
        <Text style={{ fontSize: sizes[size].fontSize, fontWeight: '700', color: getColor(score) }}>
          {score}%
        </Text>
      </View>

      {showLabel && (
        <Text style={[TextStyles.caption, { marginTop: Spacing.xs, color: Colors.neutral.gray600 }]}>
          Compatibility
        </Text>
      )}
    </View>
  );
}
```

### ElementBadge

```typescript
// components/chart/ElementBadge.tsx
interface ElementBadgeProps {
  element: 'fire' | 'earth' | 'metal' | 'water' | 'wood';
  strength?: 'strong' | 'weak' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export function ElementBadge({ element, strength = 'neutral', size = 'md' }: ElementBadgeProps) {
  const icons = {
    fire: '🔥',
    earth: '⛰️',
    metal: '⚙️',
    water: '💧',
    wood: '🌳',
  };

  const sizes = {
    sm: { padding: Spacing.xs, fontSize: Typography.fontSize.xs },
    md: { padding: Spacing.sm, fontSize: Typography.fontSize.sm },
    lg: { padding: Spacing.md, fontSize: Typography.fontSize.base },
  };

  const strengthIndicator = {
    strong: '⬆️',
    weak: '⬇️',
    neutral: '',
  };

  return (
    <View
      style={{
        backgroundColor: Colors.elements[element] + '20', // 20% opacity
        borderRadius: BorderRadius.md,
        padding: sizes[size].padding,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.elements[element],
      }}
    >
      <Text style={{ fontSize: sizes[size].fontSize }}>{icons[element]}</Text>
      <Text style={{ fontSize: sizes[size].fontSize, marginLeft: 4, fontWeight: '600', color: Colors.elements[element] }}>
        {element.charAt(0).toUpperCase() + element.slice(1)}
      </Text>
      {strength !== 'neutral' && (
        <Text style={{ fontSize: sizes[size].fontSize, marginLeft: 4 }}>
          {strengthIndicator[strength]}
        </Text>
      )}
    </View>
  );
}
```

### AssetCard

```typescript
// components/compatibility/AssetCard.tsx
interface AssetCardProps {
  asset: {
    symbol: string;
    name: string;
    compatibilityScore: number;
    type: 'crypto' | 'stock' | 'commodity';
  };
  onPress?: () => void;
}

export function AssetCard({ asset, onPress }: AssetCardProps) {
  return (
    <Card onPress={onPress} padding={Spacing.md} shadow="sm">
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
        {/* Asset icon placeholder */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.neutral.gray200,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: Spacing.md,
          }}
        >
          <Text style={{ fontSize: Typography.fontSize.lg, fontWeight: '700' }}>
            {asset.symbol.charAt(0)}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={TextStyles.bodyBold}>{asset.symbol}</Text>
          <Text style={[TextStyles.caption, { color: Colors.neutral.gray600 }]}>{asset.name}</Text>
        </View>

        <CompatibilityMeter score={asset.compatibilityScore} size="sm" showLabel={false} />
      </View>
    </Card>
  );
}
```

### TierCard (Subscription)

```typescript
// components/subscription/TierCard.tsx
interface TierCardProps {
  tier: {
    id: 'free' | 'basic' | 'pro';
    name: string;
    price: string | null;
    credits: number;
    features: string[];
  };
  isCurrentTier?: boolean;
  onPress?: () => void;
}

export function TierCard({ tier, isCurrentTier = false, onPress }: TierCardProps) {
  const isPro = tier.id === 'pro';

  return (
    <Card
      padding={Spacing.lg}
      shadow="lg"
      style={{
        borderWidth: isPro ? 2 : 0,
        borderColor: isPro ? Colors.primary.main : 'transparent',
      }}
    >
      {isPro && (
        <View style={{ position: 'absolute', top: -12, right: 16, backgroundColor: Colors.secondary.main, paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full }}>
          <Text style={[TextStyles.caption, { color: 'white', fontWeight: '700' }]}>POPULAR</Text>
        </View>
      )}

      <Text style={TextStyles.h2}>{tier.name}</Text>

      {tier.price ? (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginVertical: Spacing.md }}>
          <Text style={[TextStyles.h1, { color: Colors.primary.main }]}>{tier.price}</Text>
          <Text style={[TextStyles.caption, { color: Colors.neutral.gray600 }]}>/month</Text>
        </View>
      ) : (
        <Text style={[TextStyles.h3, { marginVertical: Spacing.md }]}>Free Forever</Text>
      )}

      <View style={{ marginBottom: Spacing.md }}>
        {tier.features.map((feature, index) => (
          <View key={index} style={{ flexDirection: 'row', marginBottom: Spacing.sm }}>
            <Text style={{ color: Colors.success.main, marginRight: Spacing.sm }}>✓</Text>
            <Text style={TextStyles.body}>{feature}</Text>
          </View>
        ))}
      </View>

      {isCurrentTier ? (
        <Button title="Current Plan" variant="outline" disabled />
      ) : (
        <Button
          title={tier.price ? 'Start Free Trial' : 'Current Plan'}
          variant={isPro ? 'primary' : 'outline'}
          onPress={onPress}
        />
      )}
    </Card>
  );
}
```

### CreditDisplay

```typescript
// components/subscription/CreditDisplay.tsx
interface CreditDisplayProps {
  credits: number;
  limit: number; // -1 for unlimited
  tier: 'free' | 'basic' | 'pro';
}

export function CreditDisplay({ credits, limit, tier }: CreditDisplayProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 100 : (credits / limit) * 100;

  const getColor = () => {
    if (isUnlimited) return Colors.success.main;
    if (percentage > 50) return Colors.success.main;
    if (percentage > 20) return Colors.warning.main;
    return Colors.error.main;
  };

  return (
    <Card padding={Spacing.md} shadow="sm">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
        <Text style={TextStyles.caption}>Predictions Remaining</Text>
        <Text style={[TextStyles.h3, { color: getColor() }]}>
          {isUnlimited ? '∞' : credits}
          {!isUnlimited && <Text style={TextStyles.caption}>/{limit}</Text>}
        </Text>
      </View>

      {!isUnlimited && (
        <View style={{ height: 8, backgroundColor: Colors.neutral.gray200, borderRadius: BorderRadius.full, overflow: 'hidden' }}>
          <View
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: getColor(),
            }}
          />
        </View>
      )}

      {!isUnlimited && credits <= 3 && (
        <TouchableOpacity onPress={() => router.push('/subscription/paywall')} style={{ marginTop: Spacing.sm }}>
          <Text style={[TextStyles.caption, { color: Colors.primary.main }]}>
            Upgrade for more predictions →
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}
```

---

## Animation Requirements

### Page Transitions

```typescript
// Use Expo Router's built-in animations
// In _layout.tsx:
import { Stack } from 'expo-router';

<Stack
  screenOptions={{
    animation: 'slide_from_right', // iOS default
    // or 'fade', 'slide_from_bottom', 'none'
  }}
/>
```

### Card Interactions

```typescript
// components/ui/PressableCard.tsx
import { Pressable, Animated } from 'react-native';

export function PressableCard({ children, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

### Loading States

```typescript
// components/ui/Skeleton.tsx
import { View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export function Skeleton({ width = '100%', height = 20, style }: any) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: Colors.neutral.gray300,
          borderRadius: BorderRadius.sm,
          opacity,
        },
        style,
      ]}
    />
  );
}
```

---

## Reusable Patterns

### List with Pull-to-Refresh

```typescript
import { FlatList, RefreshControl } from 'react-native';

<FlatList
  data={predictions}
  renderItem={({ item }) => <PredictionCard prediction={item} />}
  keyExtractor={(item) => item.id}
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      tintColor={Colors.primary.main}
    />
  }
  contentContainerStyle={{ padding: Spacing.md }}
  ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
  ListEmptyComponent={<EmptyState message="No predictions yet" />}
/>
```

### Bottom Sheet Modal

```typescript
// Use @gorhom/bottom-sheet for iOS-style bottom sheets
import BottomSheet from '@gorhom/bottom-sheet';

<BottomSheet
  snapPoints={['25%', '50%', '90%']}
  enablePanDownToClose
>
  {/* Content */}
</BottomSheet>
```

---

## Platform Differences

### iOS vs Android

| Component | iOS | Android |
|-----------|-----|---------|
| **Navigation Bar** | Translucent, large titles | Solid color, standard height |
| **Tab Bar** | Bottom tabs, translucent | Bottom navigation, material |
| **Date Picker** | Inline wheel picker | Calendar dialog |
| **Action Sheet** | iOS action sheet | Android bottom sheet |
| **Switch** | iOS toggle | Material switch |
| **Checkbox** | Custom (iOS doesn't have native) | Material checkbox |
| **Radio Button** | Custom | Material radio |

### Platform-Specific Styling

```typescript
// Use Platform.select for platform-specific styles
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  button: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
```

---

## Component Library Summary

### Base Components (8)
1. Button (4 variants, 3 sizes)
2. Input (with icons, error states)
3. Card (pressable, shadow variants)
4. Modal (4 sizes)
5. Spinner/Loading
6. Toast/Snackbar
7. Skeleton (loading state)
8. PressableCard (with animation)

### Feature Components (7)
1. PredictionCard
2. CompatibilityMeter
3. ElementBadge
4. AssetCard
5. TierCard (subscription)
6. CreditDisplay
7. ChartDisplay (birth chart visualization)

### Total: 15 reusable components covering all app needs

All components follow:
- ✅ Consistent design system (colors, typography, spacing)
- ✅ Accessibility (proper labels, contrast)
- ✅ Platform conventions (iOS/Android differences)
- ✅ Performance (memoization, native driver)
- ✅ Responsive (adapts to screen sizes)
