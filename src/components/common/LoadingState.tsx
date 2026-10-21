import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%` | '100%';
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeletonBase,
        { width: width as any, height, borderRadius },
        style,
      ]}
    />
  );
};

export const VideoCardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.cardContainer, style]}>
      <Skeleton width="100%" height={110} borderRadius={BorderRadius.lg} />
      <View style={{ padding: 10, gap: 6 }}>
        <Skeleton width="80%" height={14} borderRadius={4} />
        <Skeleton width="50%" height={10} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#E2E8F0',
    opacity: 0.6,
  },
  cardContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
