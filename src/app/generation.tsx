import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { ProgressSteps } from '@/components/generation/ProgressSteps';
import { ErrorView } from '@/components/common/ErrorView';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

export default function GenerationScreen() {
  const router = useRouter();
  const {
    draft,
    generationState,
    startGeneration,
    cancelGeneration,
    resetGenerationState,
  } = useApp();

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      startGeneration(false)
        .then((newVideoId) => {
          router.replace(`/video/${newVideoId}`);
        })
        .catch(() => {});
    }

    const onBackPress = () => {
      if (generationState.isGenerating) {
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [hasStarted]);

  const handleRetry = () => {
    resetGenerationState();
    startGeneration(false)
      .then((newVideoId) => {
        router.replace(`/video/${newVideoId}`);
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    cancelGeneration();
    router.back();
  };

  if (generationState.error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <ErrorView
            title="Generation Interrupted"
            message={generationState.error}
            onRetry={handleRetry}
            onGoBack={handleCancel}
            retryLabel="Retry Generation"
            backLabel="Back to Studio"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.badgePill}>
            <View style={styles.livePulse} />
            <Text style={styles.badgePillText}>NEURAL ENGINE RENDERING</Text>
          </View>

          {/* Optional Cancel */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCancel}
            style={styles.cancelButton}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hero Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Creating your video...</Text>
          <Text style={styles.promptSnippet} numberOfLines={2}>
            "{draft.prompt}"
          </Text>
        </View>

        {/* Animated Progress Stages */}
        <View style={styles.progressContainer}>
          <ProgressSteps
            currentStageIndex={generationState.currentStageIndex}
            progressPercent={generationState.progressPercent}
          />
        </View>

        {/* Footer Notes */}
        <View style={styles.footerNoticeBox}>
          <View style={styles.noticeIconWrap}>
            <Ionicons name="time-outline" size={16} color="#A855F7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Usually takes 1–3 minutes</Text>
            <Text style={styles.noticeSubtitle}>
              Please keep this screen open while our GPU cluster renders temporal 4K frames.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    justifyContent: 'space-between',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C4B5FD',
    letterSpacing: 0.8,
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161A28',
    borderWidth: 1,
    borderColor: '#262D42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginVertical: 16,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  promptSnippet: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 18,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 10,
  },
  footerNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#23293D',
    ...Shadows.subtle,
  },
  noticeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noticeSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
});
