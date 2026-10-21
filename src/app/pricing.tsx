import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/common/Header';
import { PlanCard } from '@/components/pricing/PlanCard';
import { SUBSCRIPTION_PLANS, PlanTier } from '@/data/plans';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

export default function PricingScreen() {
  const router = useRouter();
  const { user, upgradePlan } = useApp();

  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  const handleSelectPlan = (planId: PlanTier) => {
    upgradePlan(planId);
    Alert.alert(
      'Plan Updated! 🎉',
      `You are now subscribed to the ${planId} plan. Your video limits and render resolutions have been updated.`,
      [{ text: 'Continue', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <Header
          title="Upgrade Plan"
          showBack
          onBack={() => router.back()}
          rightAction={
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Title */}
        <View style={styles.heroSection}>
          <Text style={styles.headline}>Unlock Full AI Studio Power</Text>
          <Text style={styles.subheadline}>
            Generate longer videos, render in crisp 1080p Full HD, and access advanced spatial voices.
          </Text>

          {/* Billing Switcher (Monthly vs Annual) */}
          <View style={styles.switcherContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setBillingInterval('monthly')}
              style={[
                styles.switchTab,
                billingInterval === 'monthly' && styles.switchTabSelected,
              ]}>
              <Text
                style={[
                  styles.switchTabText,
                  billingInterval === 'monthly' && styles.switchTabTextSelected,
                ]}>
                Monthly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setBillingInterval('annual')}
              style={[
                styles.switchTab,
                billingInterval === 'annual' && styles.switchTabSelected,
              ]}>
              <Text
                style={[
                  styles.switchTabText,
                  billingInterval === 'annual' && styles.switchTabTextSelected,
                ]}>
                Annual
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>Save 20%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plan Cards */}
        <View style={styles.plansList}>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={user.plan === plan.id}
              billingInterval={billingInterval}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </View>

        {/* Guarantee Banner */}
        <View style={styles.guaranteeBox}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <View style={{ flex: 1 }}>
            <Text style={styles.guaranteeTitle}>Cancel Anytime</Text>
            <Text style={styles.guaranteeText}>
              No long term commitments. Downgrade or pause your subscription whenever you wish from the profile screen.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrap: {
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.huge,
    gap: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161A28',
    borderWidth: 1,
    borderColor: '#262D42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 320,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#10131E',
    borderRadius: BorderRadius.full,
    padding: 4,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#22283A',
  },
  switchTab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchTabSelected: {
    backgroundColor: '#8B5CF6',
    ...Shadows.subtle,
  },
  switchTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  switchTabTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  discountBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  plansList: {
    gap: 12,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#23293D',
    marginTop: 6,
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  guaranteeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
});
