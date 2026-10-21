import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GENERATION_STAGES, GenerationStage } from '@/context/AppContext';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

interface ProgressStepsProps {
  currentStageIndex: number;
  progressPercent: number;
  style?: ViewStyle;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStageIndex,
  progressPercent,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Progress Bar Header */}
      <View style={styles.barHeader}>
        <View style={styles.track}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={styles.percentText}>{Math.round(progressPercent)}%</Text>
      </View>

      {/* Stage Timeline */}
      <View style={styles.timelineList}>
        {GENERATION_STAGES.map((stage: GenerationStage, index: number) => {
          const isDone = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isPending = index > currentStageIndex;

          return (
            <View key={stage.id} style={styles.stageRow}>
              {/* Left Indicator & Connecting Line */}
              <View style={styles.indicatorCol}>
                <View
                  style={[
                    styles.circle,
                    isDone && styles.circleDone,
                    isCurrent && styles.circleCurrent,
                    isPending && styles.circlePending,
                  ]}>
                  {isDone ? (
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  ) : isCurrent ? (
                    <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                  ) : (
                    <View style={styles.pendingDot} />
                  )}
                </View>

                {index < GENERATION_STAGES.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      isDone && styles.connectorLineDone,
                    ]}
                  />
                )}
              </View>

              {/* Stage Content */}
              <View style={styles.stageContent}>
                <View style={styles.stageTitleRow}>
                  <Text
                    style={[
                      styles.stageLabel,
                      isCurrent && styles.stageLabelCurrent,
                      isPending && styles.stageLabelPending,
                    ]}>
                    {stage.label}
                  </Text>
                  {isCurrent && (
                    <View style={styles.inProgressBadge}>
                      <Text style={styles.inProgressText}>PROCESSING</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.stageDetail,
                    isCurrent && styles.stageDetailCurrent,
                    isPending && styles.stageDetailPending,
                  ]}>
                  {stage.detail}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#23293D',
    ...Shadows.card,
  },
  barHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  track: {
    flex: 1,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1B2030',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3.5,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C4B5FD',
    minWidth: 42,
    textAlign: 'right',
  },
  timelineList: {
    gap: 0,
  },
  stageRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  circleDone: {
    backgroundColor: '#10B981',
  },
  circleCurrent: {
    backgroundColor: '#8B5CF6',
    ...Shadows.glow,
  },
  circlePending: {
    backgroundColor: '#141824',
    borderWidth: 1.5,
    borderColor: '#242B3E',
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3E4763',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#1E2436',
    marginVertical: 4,
  },
  connectorLineDone: {
    backgroundColor: '#10B981',
  },
  stageContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stageLabelCurrent: {
    color: '#C4B5FD',
    fontWeight: '800',
  },
  stageLabelPending: {
    color: Colors.textMuted,
  },
  inProgressBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  inProgressText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C4B5FD',
    letterSpacing: 0.5,
  },
  stageDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stageDetailCurrent: {
    color: '#E2E8F0',
  },
  stageDetailPending: {
    color: '#475569',
  },
});
