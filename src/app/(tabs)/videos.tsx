import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/common/Header';
import { VideoCard } from '@/components/video/VideoCard';
import { EmptyState } from '@/components/common/EmptyState';
import { CreditBalance } from '@/components/common/CreditBalance';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { VideoItem } from '@/data/mockVideos';

type FilterTab = 'all' | 'completed' | 'processing' | 'failed';

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All Videos' },
  { id: 'completed', label: 'Completed' },
  { id: 'processing', label: 'Processing' },
  { id: 'failed', label: 'Failed' },
];

export default function MyVideosScreen() {
  const router = useRouter();
  const { videos, user } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = useMemo(() => {
    return videos.filter((v: VideoItem) => {
      if (activeFilter !== 'all' && v.status !== activeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          v.title.toLowerCase().includes(query) ||
          v.prompt.toLowerCase().includes(query) ||
          v.style.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [videos, activeFilter, searchQuery]);

  const column1 = filteredVideos.filter((_, i) => i % 2 === 0);
  const column2 = filteredVideos.filter((_, i) => i % 2 === 1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.headerWrap}>
        <Header
          title="My Videos"
          subtitle={`${videos.length} creations in library`}
          rightAction={
            <CreditBalance
              credits={user.creditsRemaining}
              variant="pill"
              onBuyPress={() => router.push('/credits')}
            />
          }
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={[styles.searchBox, Shadows.subtle]}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, prompt, or style..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {FILTER_TABS.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.7}
                onPress={() => setActiveFilter(tab.id)}
                style={[
                  styles.filterTabButton,
                  isSelected && styles.filterTabButtonSelected,
                ]}>
                <Text
                  style={[
                    styles.filterTabText,
                    isSelected && styles.filterTabTextSelected,
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Video Grid or Empty State */}
        {filteredVideos.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No matching videos' : 'No videos yet'}
            description={
              searchQuery
                ? 'Try a different search term or change your active status filter.'
                : 'Create your first AI video with our generative studio.'
            }
            actionLabel="Create Video"
            onAction={() => router.push('/(tabs)/create')}
          />
        ) : (
          <View style={styles.gridContainer}>
            <View style={styles.gridCol}>
              {column1.map((video) => (
                <VideoCard key={video.id} video={video} layout="grid" />
              ))}
            </View>
            <View style={styles.gridCol}>
              {column2.map((video) => (
                <VideoCard key={video.id} video={video} layout="grid" />
              ))}
            </View>
          </View>
        )}
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
    paddingBottom: 110,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#23293D',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  filterTabButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: '#121522',
    borderWidth: 1,
    borderColor: '#22283C',
  },
  filterTabButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    ...Shadows.subtle,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTabTextSelected: {
    color: '#FFF',
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCol: {
    flex: 1,
  },
});
