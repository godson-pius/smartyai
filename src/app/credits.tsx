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
import { CreditPackageCard } from '@/components/credits/CreditPackageCard';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { CREDIT_PACKAGES } from '@/data/creditPackages';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

export default function BuyCreditsScreen() {
  const router = useRouter();
  const { user, purchaseCredits } = useApp();

  const [selectedPackId, setSelectedPackId] = useState<string>('plus');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const selectedPack = CREDIT_PACKAGES.find((p) => p.id === selectedPackId) || CREDIT_PACKAGES[1];

  const handlePurchase = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const success = purchaseCredits(selectedPack.id);
      if (success) {
        const addedCredits = selectedPack.credits + (selectedPack.bonusCredits || 0);
        Alert.alert(
          'Credits Added! ✨',
          `Successfully added ${addedCredits} AI credits to your account. Your new balance is ${user.creditsRemaining + addedCredits} credits.`,
          [{ text: 'Continue Creating', onPress: () => router.back() }]
        );
      }
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <Header
          title="Buy AI Credits"
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
        {/* Current Balance Banner */}
        <Card style={styles.balanceCard} padding={16}>
          <View style={styles.balanceRow}>
            <View style={styles.sparkleWrap}>
              <Ionicons name="sparkles" size={20} color="#C4B5FD" />
            </View>
            <View>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceAmount}>{user.creditsRemaining} credits</Text>
            </View>
          </View>
          <Text style={styles.balanceHint}>
            1 credit ≈ generated temporal frames. Never expires.
          </Text>
        </Card>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select a Credit Pack</Text>
          <Text style={styles.sectionSubtitle}>
            Top up your balance instantly to generate high definition videos
          </Text>
        </View>

        {/* Package Options */}
        <View style={styles.packageList}>
          {CREDIT_PACKAGES.map((pack) => (
            <CreditPackageCard
              key={pack.id}
              pack={pack}
              isSelected={selectedPackId === pack.id}
              onSelect={() => setSelectedPackId(pack.id)}
            />
          ))}
        </View>

        {/* Breakdown Card */}
        <Card style={styles.summaryCard} padding={16}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected package</Text>
            <Text style={styles.summaryValue}>{selectedPack.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Credits credited</Text>
            <Text style={styles.summaryValueHighlight}>
              {selectedPack.credits + (selectedPack.bonusCredits || 0)} credits
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total amount</Text>
            <Text style={styles.totalValue}>${selectedPack.price}.00</Text>
          </View>
        </Card>

        {/* Purchase CTA */}
        <View style={styles.ctaWrapper}>
          <Button
            label={`Buy ${selectedPack.credits + (selectedPack.bonusCredits || 0)} Credits for $${selectedPack.price}`}
            variant="gradient"
            size="lg"
            iconName="card-outline"
            isLoading={isProcessing}
            onPress={handlePurchase}
            fullWidth
          />
          <Text style={styles.secureText}>
            🔒 Mock Checkout Preview • Instant Neural Crediting
          </Text>
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
  balanceCard: {
    backgroundColor: '#121522',
    borderColor: '#23293D',
    marginTop: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sparkleWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  balanceHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E2436',
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  packageList: {
    gap: 10,
  },
  summaryCard: {
    backgroundColor: '#0F121C',
    borderColor: '#22283A',
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C4B5FD',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#1E2436',
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ctaWrapper: {
    marginTop: 8,
    alignItems: 'center',
    gap: 8,
  },
  secureText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
