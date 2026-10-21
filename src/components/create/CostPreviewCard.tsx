import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

interface CostPreviewCardProps {
  durationLabel: string;
  styleName: string;
  voiceDescription: string;
  estimatedCredits: number;
  creditsRemaining: number;
  onGenerate: () => void;
  isLoading?: boolean;
  style?: ViewStyle;
}

export const CostPreviewCard: React.FC<CostPreviewCardProps> = ({
  durationLabel,
  styleName,
  voiceDescription,
  estimatedCredits,
  creditsRemaining,
  onGenerate,
  isLoading = false,
  style,
}) => {
  const router = useRouter();
  const hasEnoughCredits = creditsRemaining >= estimatedCredits;

  return (
    <Card style={[styles.container, Shadows.card, style]} padding={20}>
      <View style={styles.headerRow}>
        <View style={styles.sparkleWrap}>
          <Ionicons name="sparkles" size={16} color="#A855F7" />
        </View>
        <Text style={styles.headerTitle}>Generation Parameters</Text>
      </View>

      {/* Breakdown list */}
      <View style={styles.breakdownList}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Video duration</Text>
          <Text style={styles.rowValue}>{durationLabel}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Visual style</Text>
          <Text style={styles.rowValue}>{styleName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Voice & Audio</Text>
          <Text style={styles.rowValue} numberOfLines={1}>
            {voiceDescription}
          </Text>
        </View>

        <View style={[styles.row, styles.dividerRow]}>
          <Text style={styles.costLabel}>Estimated AI credits</Text>
          <View style={styles.costTag}>
            <Ionicons name="flash" size={13} color="#C4B5FD" />
            <Text style={styles.costValue}>{estimatedCredits} credits</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.balanceLabel}>Credits remaining</Text>
          <Text
            style={[
              styles.balanceValue,
              !hasEnoughCredits && { color: Colors.error },
            ]}>
            {creditsRemaining} credits
          </Text>
        </View>
      </View>

      {/* Insufficient credits warning */}
      {!hasEnoughCredits && (
        <View style={styles.warningBox}>
          <Ionicons name="alert-circle" size={16} color="#F87171" />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningText}>
              Insufficient credits. You need {estimatedCredits - creditsRemaining} more credits.
            </Text>
          </View>
          <Button
            label="Top Up"
            size="sm"
            variant="outline"
            onPress={() => router.push('/credits')}
          />
        </View>
      )}

      {/* Primary CTA button */}
      <View style={styles.ctaWrapper}>
        <Button
          label={hasEnoughCredits ? 'Generate Video' : 'Add Credits to Generate'}
          variant="gradient"
          size="lg"
          fullWidth
          iconName={hasEnoughCredits ? 'sparkles' : 'add-circle-outline'}
          isLoading={isLoading}
          onPress={hasEnoughCredits ? onGenerate : () => router.push('/credits')}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#131624',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: '#242B42',
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sparkleWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  breakdownList: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    borderTopWidth: 1,
    borderTopColor: '#1E2436',
    paddingTop: 12,
    marginTop: 4,
  },
  costLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  costTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  costValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C4B5FD',
  },
  balanceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  balanceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 12,
    borderRadius: BorderRadius.lg,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningText: {
    fontSize: 12,
    color: '#F87171',
    fontWeight: '600',
  },
  ctaWrapper: {
    marginTop: 18,
  },
});
