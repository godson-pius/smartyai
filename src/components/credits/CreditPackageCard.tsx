import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreditPackage } from '@/data/creditPackages';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

interface CreditPackageCardProps {
  pack: CreditPackage;
  isSelected: boolean;
  onSelect: () => void;
  style?: ViewStyle;
}

export const CreditPackageCard: React.FC<CreditPackageCardProps> = ({
  pack,
  isSelected,
  onSelect,
  style,
}) => {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.cardSelected,
        Shadows.subtle,
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
        style,
      ]}>
      {/* Optional Badge */}
      {pack.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{pack.badge}</Text>
        </View>
      )}

      <View style={styles.leftCol}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{pack.name}</Text>
          {pack.bonusCredits ? (
            <View style={styles.bonusTag}>
              <Text style={styles.bonusTagText}>+{pack.bonusCredits} Bonus</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.description}>{pack.description}</Text>

        <View style={styles.creditsRow}>
          <Ionicons name="sparkles" size={15} color="#A855F7" />
          <Text style={styles.creditsAmount}>
            {pack.credits + (pack.bonusCredits || 0)} Total Credits
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <View style={styles.priceTag}>
          <Text style={styles.priceCurrency}>$</Text>
          <Text style={styles.priceAmount}>{pack.price}</Text>
        </View>

        {/* Radio Selection Indicator */}
        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#23293D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    ...Shadows.hover,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderBottomLeftRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  leftCol: {
    flex: 1,
    paddingRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bonusTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bonusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creditsAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C4B5FD',
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 12,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#333D56',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0C13',
  },
  radioCircleSelected: {
    borderColor: '#8B5CF6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
  },
});
