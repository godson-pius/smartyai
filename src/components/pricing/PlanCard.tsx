import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Plan } from '@/data/plans';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  billingInterval: 'monthly' | 'annual';
  onSelectPlan: (planId: Plan['id']) => void;
  style?: ViewStyle;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrent,
  billingInterval,
  onSelectPlan,
  style,
}) => {
  const price = billingInterval === 'monthly' ? plan.priceMonthly : plan.priceAnnualMonthly;

  return (
    <Card
      style={[
        styles.card,
        plan.isPopular && styles.popularCard,
        isCurrent && styles.currentCard,
        style,
      ]}
      padding={20}>
      {/* Popular Badge */}
      {plan.isPopular && (
        <View style={styles.popularBadge}>
          <Ionicons name="sparkles" size={11} color="#FFFFFF" />
          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}

      {/* Plan Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planLimits}>{plan.videoLimit}</Text>
        </View>

        {isCurrent && (
          <View style={styles.currentPlanTag}>
            <Text style={styles.currentPlanTagText}>Active Plan</Text>
          </View>
        )}
      </View>

      {/* Pricing display */}
      <View style={styles.pricingRow}>
        <Text style={styles.currencySymbol}>$</Text>
        <Text style={styles.priceAmount}>{price}</Text>
        <Text style={styles.pricePeriod}>/ month</Text>
      </View>
      {billingInterval === 'annual' && (
        <Text style={styles.billedYearlyText}>Billed annually (Save 20%)</Text>
      )}

      {/* Key specifications box */}
      <View style={styles.specsBox}>
        <View style={styles.specItem}>
          <Ionicons name="time-outline" size={15} color="#A855F7" />
          <Text style={styles.specText}>{plan.maxDurationLabel}</Text>
        </View>
        <View style={styles.specDivider} />
        <View style={styles.specItem}>
          <Ionicons name="videocam-outline" size={15} color="#A855F7" />
          <Text style={styles.specText}>{plan.resolution}</Text>
        </View>
      </View>

      {/* Feature check list */}
      <View style={styles.featureList}>
        {plan.features.map((feature, idx) => (
          <View key={idx} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Action CTA */}
      <View style={styles.ctaWrapper}>
        <Button
          label={isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
          variant={isCurrent ? 'secondary' : plan.isPopular ? 'gradient' : 'outline'}
          disabled={isCurrent}
          onPress={() => onSelectPlan(plan.id)}
          fullWidth
          size="md"
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: '#23293D',
    marginVertical: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  popularCard: {
    borderColor: '#8B5CF6',
    backgroundColor: '#141829',
    ...Shadows.glow,
  },
  currentCard: {
    backgroundColor: '#0F121C',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planLimits: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  currentPlanTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  currentPlanTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C4B5FD',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginHorizontal: 2,
  },
  pricePeriod: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  billedYearlyText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  specsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0C13',
    borderRadius: BorderRadius.md,
    padding: 10,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#1D2336',
  },
  specItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  specDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#1E2436',
  },
  specText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  featureList: {
    gap: 10,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  ctaWrapper: {
    marginTop: 4,
  },
});
