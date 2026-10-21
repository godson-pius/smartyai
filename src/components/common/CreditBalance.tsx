import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { Card } from './Card';

interface CreditBalanceProps {
  credits: number;
  totalCredits?: number;
  variant?: 'card' | 'pill' | 'compact';
  onBuyPress?: () => void;
  style?: ViewStyle;
}

export const CreditBalance: React.FC<CreditBalanceProps> = ({
  credits,
  totalCredits = 250,
  variant = 'card',
  onBuyPress,
  style,
}) => {
  const router = useRouter();

  const handleBuy = () => {
    if (onBuyPress) {
      onBuyPress();
    } else {
      router.push('/credits');
    }
  };

  const percentage = Math.min(Math.max((credits / totalCredits) * 100, 0), 100);

  if (variant === 'pill') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleBuy}
        style={[styles.pillContainer, style]}>
        <View style={styles.pillIconWrap}>
          <Ionicons name="sparkles" size={12} color="#A855F7" />
        </View>
        <Text style={styles.pillText}>{credits} credits</Text>
        <Ionicons name="add-circle" size={14} color="#A855F7" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <View style={[styles.compactRow, style]}>
        <Ionicons name="sparkles" size={15} color={Colors.primary} />
        <Text style={styles.compactText} numberOfLines={1}>
          <Text style={{ fontWeight: '700', color: '#FFF' }}>{credits}</Text> credits left
        </Text>
      </View>
    );
  }

  return (
    <Card style={[styles.cardContainer, style]} padding={18}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardTitleWrap}>
          <View style={styles.sparkleBadge}>
            <Ionicons name="sparkles" size={17} color="#A855F7" />
          </View>
          <View style={styles.textColumn}>
            <Text style={styles.cardEyebrow}>AI CREDITS</Text>
            <Text style={styles.creditValueText} numberOfLines={1} adjustsFontSizeToFit>
              <Text style={styles.creditHighlight}>{credits}</Text> credits remaining
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBuy}
          style={styles.topUpButton}>
          <Ionicons name="add" size={15} color="#C4B5FD" />
          <Text style={styles.topUpButtonText}>Top Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarTrack}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressBarFill,
              { width: `${percentage}%` },
            ]}
          />
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressSubtext}>Monthly allocation active</Text>
          <Text style={styles.progressSubtext}>
            {credits} / {totalCredits}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#131624',
    borderColor: '#232A40',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  sparkleBadge: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
  },
  cardEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A855F7',
    letterSpacing: 0.8,
  },
  creditValueText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 1,
  },
  creditHighlight: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.45)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    flexShrink: 0,
  },
  topUpButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C4B5FD',
  },
  progressSection: {
    marginTop: 14,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#1E2438',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  pillIconWrap: {
    marginRight: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C4B5FD',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
