import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export type ButtonVariant = 'primary' | 'gradient' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconRight?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  iconName,
  iconRight = false,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const isInteractive = !disabled && !isLoading;

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13, iconSize: 15 },
    md: { paddingVertical: 13, paddingHorizontal: 20, fontSize: 14, iconSize: 17 },
    lg: { paddingVertical: 15, paddingHorizontal: 24, fontSize: 15, iconSize: 19 },
  }[size];

  const content = (
    <View style={styles.innerRow}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#FFFFFF'}
          style={{ marginRight: 8 }}
        />
      ) : iconName && !iconRight ? (
        <Ionicons
          name={iconName}
          size={sizeStyles.iconSize}
          color={getIconColor(variant, disabled)}
          style={{ marginRight: 8 }}
        />
      ) : null}

      <Text
        style={[
          styles.text,
          { fontSize: sizeStyles.fontSize },
          getTextColorStyle(variant, disabled),
          textStyle,
        ]}>
        {label}
      </Text>

      {!isLoading && iconName && iconRight && (
        <Ionicons
          name={iconName}
          size={sizeStyles.iconSize}
          color={getIconColor(variant, disabled)}
          style={{ marginLeft: 8 }}
        />
      )}
    </View>
  );

  if ((variant === 'gradient' || variant === 'primary') && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        disabled={!isInteractive}
        style={({ pressed }) => [
          styles.base,
          { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
          fullWidth && styles.fullWidth,
          Shadows.glow,
          style,
        ]}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#A855F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
          style={[
            styles.gradientContainer,
            { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal },
          ]}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!isInteractive}
      style={[
        styles.base,
        getContainerStyle(variant, disabled),
        { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal },
        fullWidth && styles.fullWidth,
        style,
      ]}>
      {content}
    </TouchableOpacity>
  );
};

function getIconColor(variant: ButtonVariant, disabled: boolean): string {
  if (disabled) return Colors.textMuted;
  if (variant === 'primary' || variant === 'gradient' || variant === 'danger') return '#FFFFFF';
  if (variant === 'secondary') return Colors.text;
  return Colors.primary;
}

function getTextColorStyle(variant: ButtonVariant, disabled: boolean): TextStyle {
  if (disabled) return { color: Colors.textMuted };
  switch (variant) {
    case 'primary':
    case 'gradient':
    case 'danger':
      return { color: '#FFFFFF', fontWeight: '700' };
    case 'secondary':
      return { color: Colors.text, fontWeight: '600' };
    case 'outline':
    case 'ghost':
      return { color: Colors.primary, fontWeight: '700' };
    default:
      return { color: '#FFFFFF', fontWeight: '700' };
  }
}

function getContainerStyle(variant: ButtonVariant, disabled: boolean): ViewStyle {
  if (disabled) {
    return {
      backgroundColor: '#1E2333',
      borderWidth: 1,
      borderColor: '#262D42',
    };
  }
  switch (variant) {
    case 'secondary':
      return {
        backgroundColor: '#161A28',
        borderWidth: 1,
        borderColor: '#262E44',
      };
    case 'outline':
      return {
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        borderWidth: 1.5,
        borderColor: Colors.primary,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
      };
    case 'danger':
      return {
        backgroundColor: '#7F1D1D',
        borderWidth: 1,
        borderColor: '#991B1B',
      };
    default:
      return {
        backgroundColor: Colors.primary,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  gradientContainer: {
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: -0.2,
  },
});
