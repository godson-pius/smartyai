import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  badge: string;
  badgeIcon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  gradientColors: [string, string];
  visualType: 'video' | 'audio' | 'export';
  accentColor: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    badge: 'AI VIDEO STUDIO',
    badgeIcon: 'sparkles',
    title: 'Turn Any Idea Into\nCinematic Video',
    subtitle:
      'Transform prompts into high-definition scenes with lifelike lighting, dynamic camera movements, and fluid temporal motion.',
    gradientColors: ['#6366F1', '#8B5CF6'],
    visualType: 'video',
    accentColor: '#8B5CF6',
  },
  {
    id: 'slide-2',
    badge: 'NEURAL AUDIO & VOICES',
    badgeIcon: 'mic',
    title: 'Expressive Voices &\nSpatial Soundscapes',
    subtitle:
      'Bring your scenes to life with 18+ studio voice models across African, US, UK, and global accents plus synchronized atmospheric audio.',
    gradientColors: ['#EC4899', '#8B5CF6'],
    visualType: 'audio',
    accentColor: '#EC4899',
  },
  {
    id: 'slide-3',
    badge: 'INSTANT CREATOR EXPORTS',
    badgeIcon: 'flash',
    title: 'Multi-Ratio Formats,\nZero Watermarks',
    subtitle:
      'Publish in 9:16 vertical for TikTok & Reels or 16:9 for YouTube. Render in crisp 1080p Full HD ready for immediate sharing.',
    gradientColors: ['#10B981', '#6366F1'],
    visualType: 'export',
    accentColor: '#10B981',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, continueAsGuest } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const handleNext = async () => {
    triggerHaptic();
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await completeOnboarding();
      router.replace('/auth/signup');
    }
  };

  const handleSkip = async () => {
    triggerHaptic();
    await completeOnboarding();
    router.replace('/auth/login');
  };

  const handleGuestEntry = async () => {
    triggerHaptic();
    await continueAsGuest();
    router.replace('/(tabs)');
  };

  const renderVisualCard = (type: OnboardingSlide['visualType'], accentColor: string) => {
    if (type === 'video') {
      return (
        <View style={[styles.visualCard, Shadows.glow]}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80',
            }}
            style={styles.cardImageCover}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(11, 13, 21, 0.95)']}
            style={styles.cardVignette}
          />
          {/* Floating UI Elements */}
          <View style={styles.cardTopPill}>
            <View style={[styles.pulseDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.cardPillText}>Rendering 24fps • Ultra 4K</Text>
          </View>
          <View style={styles.cardPromptBox}>
            <View style={styles.cardPromptHeader}>
              <Ionicons name="film-outline" size={13} color="#C4B5FD" />
              <Text style={styles.cardPromptTag}>Cinematic Tracking Shot</Text>
            </View>
            <Text style={styles.cardPromptText} numberOfLines={2}>
              "A golden hour sunset over modern Kigali, vibrant street market, volumetric haze..."
            </Text>
          </View>
        </View>
      );
    }

    if (type === 'audio') {
      return (
        <View style={[styles.visualCard, Shadows.glow]}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
            }}
            style={styles.cardImageCover}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(11, 13, 21, 0.4)', 'rgba(11, 13, 21, 0.95)']}
            style={styles.cardVignette}
          />
          <View style={styles.audioCenterStack}>
            <View style={styles.voiceWaveContainer}>
              {[28, 48, 68, 36, 76, 52, 90, 60, 44, 70, 32].map((height, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    {
                      height,
                      backgroundColor: i % 2 === 0 ? accentColor : '#8B5CF6',
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.voiceMetaRow}>
              <View style={styles.voiceMetaIcon}>
                <Ionicons name="headset" size={14} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.voiceMetaTitle}>Amara • African English</Text>
                <Text style={styles.voiceMetaSub}>Harmonized cinematic narration</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    // Export Visual
    return (
      <View style={[styles.visualCard, Shadows.glow]}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
          }}
          style={styles.cardImageCover}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(11, 13, 21, 0.95)']}
          style={styles.cardVignette}
        />
        <View style={styles.exportGridPreview}>
          <View style={styles.exportOptionPill}>
            <Ionicons name="phone-portrait-outline" size={16} color="#EC4899" />
            <Text style={styles.exportOptionText}>9:16 Vertical (Reels/TikTok)</Text>
          </View>
          <View style={styles.exportOptionPill}>
            <Ionicons name="tv-outline" size={16} color="#38BDF8" />
            <Text style={styles.exportOptionText}>16:9 Widescreen (YouTube/Film)</Text>
          </View>
          <View style={[styles.exportOptionPill, { borderColor: '#10B981' }]}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.exportOptionText, { color: '#10B981' }]}>
              1080p FHD • Zero Watermarks
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSlideItem = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slideContainer}>
        {/* Visual Mockup Area */}
        <View style={styles.visualContainer}>
          {renderVisualCard(item.visualType, item.accentColor)}
        </View>

        {/* Text Content */}
        <View style={styles.textContentWrap}>
          <View style={styles.badgeRow}>
            <View style={styles.badgeWrap}>
              <Ionicons name={item.badgeIcon} size={13} color="#C4B5FD" />
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          </View>

          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Image
            source={require('../../assets/images/lazanicon.png')}
            style={styles.brandIcon}
            contentFit="contain"
          />
          <Text style={styles.brandName}>LAZAN</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSkip}
          style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Pager */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlideItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.pager}
      />

      {/* Bottom Navigation & Controls */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const isActive = i === currentIndex;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isActive ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            );
          })}
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          style={styles.ctaButton}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}>
            <Text style={styles.ctaButtonText}>
              {isLastSlide ? 'Get Started • Create Video' : 'Next Step'}
            </Text>
            <Ionicons
              name={isLastSlide ? 'arrow-forward' : 'chevron-forward'}
              size={18}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer Sub-links */}
        <View style={styles.footerLinksRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleGuestEntry}
            style={styles.guestLinkWrap}>
            <Text style={styles.guestLinkText}>Continue as Guest</Text>
          </TouchableOpacity>

          <Text style={styles.footerDotSeparator}>•</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.replace('/auth/login')}
            style={styles.guestLinkWrap}>
            <Text style={styles.loginLinkText}>Sign In</Text>
          </TouchableOpacity>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pager: {
    flex: 1,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  visualCard: {
    width: '100%',
    height: 260,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    position: 'relative',
  },
  cardImageCover: {
    width: '100%',
    height: '100%',
  },
  cardVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardTopPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(9, 10, 15, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  cardPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardPromptBox: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(17, 20, 30, 0.85)',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  cardPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  cardPromptTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C4B5FD',
  },
  cardPromptText: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 17,
  },
  audioCenterStack: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    gap: 14,
  },
  voiceWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 90,
  },
  waveformBar: {
    width: 6,
    borderRadius: 3,
  },
  voiceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(17, 20, 30, 0.85)',
    padding: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  voiceMetaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accentPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceMetaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  voiceMetaSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  exportGridPreview: {
    position: 'absolute',
    bottom: 18,
    left: 14,
    right: 14,
    gap: 8,
  },
  exportOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(17, 20, 30, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exportOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textContentWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  badgeRow: {
    marginBottom: 10,
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#C4B5FD',
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 33,
    marginBottom: 10,
  },
  slideSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  ctaButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.glow,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  guestLinkWrap: {
    paddingVertical: 4,
  },
  guestLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  footerDotSeparator: {
    color: '#475569',
  },
  loginLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C4B5FD',
  },
});
