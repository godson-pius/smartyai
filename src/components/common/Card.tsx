import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle, StyleProp, Pressable, View } from 'react-native';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'flat' | 'subtle' | 'bordered';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 16,
}) => {
  const containerStyles = [
    styles.card,
    variant === 'default' && Shadows.card,
    variant === 'subtle' && styles.subtle,
    variant === 'bordered' && styles.bordered,
    { padding },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          containerStyles,
          pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
        ]}>
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121520',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#22283A',
  },
  subtle: {
    backgroundColor: '#0E1119',
    borderColor: '#191E2C',
  },
  bordered: {
    backgroundColor: '#121520',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
});
