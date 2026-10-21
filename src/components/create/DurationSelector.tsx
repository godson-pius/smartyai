import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DURATION_OPTIONS, VideoDurationOption } from '@/data/plans';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

interface DurationSelectorProps {
  selectedDurationId: string;
  onSelectDuration: (durationId: string) => void;
  canAccessDuration: (durationId: string) => boolean;
  style?: ViewStyle;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDurationId,
  onSelectDuration,
  canAccessDuration,
  style,
}) => {
  const router = useRouter();

  const handlePress = (option: VideoDurationOption) => {
    const isAvailable = canAccessDuration(option.id);
    if (!isAvailable) {
      router.push('/pricing');
      return;
    }
    onSelectDuration(option.id);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.segmentContainer}>
        {DURATION_OPTIONS.map((option) => {
          const isSelected = option.id === selectedDurationId;
          const isAvailable = canAccessDuration(option.id);

          return (
            <Pressable
              key={option.id}
              onPress={() => handlePress(option)}
              style={({ pressed }) => [
                styles.segmentItem,
                isSelected && styles.segmentItemSelected,
                !isAvailable && styles.segmentItemLocked,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}>
              {/* Duration Time Label */}
              <View style={styles.labelRow}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={isSelected ? '#C4B5FD' : isAvailable ? '#CBD5E1' : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.durationText,
                    isSelected && styles.durationTextSelected,
                    !isAvailable && styles.textLocked,
                  ]}>
                  {option.label}
                </Text>

                {/* Lock Badge cleanly beside without fighting */}
                {!isAvailable && (
                  <View style={styles.lockIconPill}>
                    <Ionicons name="lock-closed" size={10} color="#F59E0B" />
                  </View>
                )}
              </View>

              {/* Subtext: Credits & Use Case */}
              <View style={styles.subtextRow}>
                <Text
                  style={[
                    styles.creditText,
                    isSelected && styles.creditTextSelected,
                    !isAvailable && styles.textLocked,
                  ]}>
                  {option.creditCost} cr
                </Text>
                <Text style={styles.dot}>•</Text>
                <Text
                  style={[
                    styles.planTierText,
                    isSelected && styles.planTierTextSelected,
                    !isAvailable && styles.planTierLocked,
                  ]}>
                  {isAvailable ? (option.id === '20s' ? 'Shorts' : 'Standard') : 'Upgrade'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#0D0F18',
    borderRadius: BorderRadius.xl,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#20263A',
    gap: 6,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemSelected: {
    backgroundColor: '#1E1B4B',
    borderWidth: 1.2,
    borderColor: '#8B5CF6',
    ...Shadows.subtle,
  },
  segmentItemLocked: {
    opacity: 0.65,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  durationTextSelected: {
    color: '#FFFFFF',
  },
  textLocked: {
    color: Colors.textMuted,
  },
  lockIconPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 2,
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  creditText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A855F7',
  },
  creditTextSelected: {
    color: '#C4B5FD',
  },
  dot: {
    fontSize: 8,
    color: '#3B4462',
    marginHorizontal: 4,
  },
  planTierText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  planTierTextSelected: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  planTierLocked: {
    color: '#F59E0B',
    fontWeight: '700',
  },
});
