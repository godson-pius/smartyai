import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { CreditBalance } from '@/components/common/CreditBalance';
import { Button } from '@/components/common/Button';
import { VideoCard } from '@/components/video/VideoCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

const QUICK_CREATE_ITEMS = [
  { id: 'cinematic', label: 'Cinematic', icon: 'film-outline', color: '#8B5CF6' },
  { id: 'social-media', label: 'Social Media', icon: 'phone-portrait-outline', color: '#EC4899' },
  { id: 'promotional', label: 'Advertisement', icon: 'megaphone-outline', color: '#F59E0B' },
  { id: 'fashion', label: 'Fashion', icon: 'sparkles-outline', color: '#F43F5E' },
  { id: 'educational', label: 'Educational', icon: 'school-outline', color: '#10B981' },
  { id: 'movie', label: 'Story', icon: 'videocam-outline', color: '#6366F1' },
  { id: 'comedy', label: 'Comedy', icon: 'happy-outline', color: '#F97316' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, videos, updateDraft } = useApp();

  const handleQuickCreate = (styleId: string) => {
    updateDraft({ styleId });
    router.push('/(tabs)/create');
  };

  const recentVideos = videos.slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Good morning 👋</Text>
            <Text style={styles.subGreetingText}>What will you create today?</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.avatarButton}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarInitial}>
                {user.name.charAt(0)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hero AI Video Studio Card */}
        <View style={[styles.heroCard, Shadows.glow]}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.25)', 'rgba(168, 85, 247, 0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradientBg}
          />
          <View style={styles.heroTextContent}>
            <View style={styles.heroPill}>
              <Ionicons name="sparkles" size={12} color="#C4B5FD" />
              <Text style={styles.heroPillText}>AI GENERATIVE SUITE</Text>
            </View>
            <Text style={styles.heroTitle}>Turn your ideas into cinematic video</Text>
            <Text style={styles.heroDescription}>
              High-resolution scenes, realistic voices, and automated camera direction in seconds.
            </Text>
          </View>

          <View style={styles.heroActionWrap}>
            <Button
              label="Create a Video"
              variant="gradient"
              size="lg"
              iconName="arrow-forward"
              iconRight
              onPress={() => router.push('/(tabs)/create')}
            />
          </View>
        </View>

        {/* AI Credits Section */}
        <View style={styles.sectionWrap}>
          <CreditBalance
            credits={user.creditsRemaining}
            totalCredits={user.totalCredits}
            onBuyPress={() => router.push('/credits')}
          />
        </View>

        {/* Quick Create Carousel */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Quick Create</Text>
            <Text style={styles.sectionSubtitle}>Start from a curated style</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickCreateScroll}>
            {QUICK_CREATE_ITEMS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleQuickCreate(item.id)}
                style={({ pressed }) => [
                  styles.quickCreateCard,
                  pressed && { opacity: 0.88, transform: [{ scale: 0.96 }] },
                ]}>
                <View
                  style={[
                    styles.quickIconCircle,
                    { backgroundColor: `${item.color}22` },
                  ]}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={item.color}
                  />
                </View>
                <Text style={styles.quickCreateLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Recent Videos Section */}
        <View style={[styles.sectionWrap, { marginBottom: 32 }]}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Recent Videos</Text>
              <Text style={styles.sectionSubtitle}>Your generated projects</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/videos')}
              style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color="#A855F7"
              />
            </TouchableOpacity>
          </View>

          {recentVideos.length === 0 ? (
            <EmptyState
              title="No videos yet"
              description="Start by creating your first AI video with a simple text idea."
              actionLabel="Create a Video"
              onAction={() => router.push('/(tabs)/create')}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentVideosScroll}>
              {recentVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  layout="horizontal"
                />
              ))}
            </ScrollView>
          )}
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subGreetingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  avatarButton: {
    padding: 2,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#161A28',
    borderWidth: 2,
    borderColor: '#3B4462',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: '#C4B5FD',
  },
  heroCard: {
    backgroundColor: '#121524',
    borderRadius: BorderRadius.xxl,
    padding: 20,
    marginTop: 10,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#2A334E',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroTextContent: {
    marginBottom: 16,
    zIndex: 1,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C4B5FD',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  heroDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 6,
  },
  heroActionWrap: {
    marginTop: 4,
    zIndex: 1,
  },
  sectionWrap: {
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A855F7',
  },
  quickCreateScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  quickCreateCard: {
    alignItems: 'center',
    backgroundColor: '#121522',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#22283C',
    minWidth: 88,
    ...Shadows.subtle,
  },
  quickIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickCreateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recentVideosScroll: {
    paddingVertical: 4,
  },
});
