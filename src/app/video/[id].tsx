import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

export default function VideoResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVideoById } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const video = id ? getVideoById(id) : undefined;

  if (!video) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Video Result" showBack onBack={() => router.replace('/(tabs)/videos')} />
        <View style={styles.centerContainer}>
          <EmptyState
            title="Video Not Found"
            description="The requested video could not be loaded or may have been removed."
            actionLabel="Back to My Videos"
            onAction={() => router.replace('/(tabs)/videos')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handlePlayToggle = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleDownload = () => {
    if (downloadProgress !== null) return;
    setDownloadProgress(20);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadProgress(null);
            Alert.alert('Saved to Camera Roll', 'Your 1080p Full HD video has been saved to your photo library.');
          }, 300);
          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: video.title,
        message: `Watch my AI-generated video "${video.title}": https://lazan.ai/v/${video.id}`,
      });
    } catch (error) {
      // dismissed
    }
  };

  const handleCreateAnother = () => {
    router.replace('/(tabs)/create');
  };

  const handleBackToLibrary = () => {
    router.replace('/(tabs)/videos');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <Header
          title="Video Result"
          showBack
          onBack={handleBackToLibrary}
          rightAction={
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShare}
              style={styles.shareIconButton}>
              <Ionicons name="share-outline" size={19} color="#FFFFFF" />
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Celebration Banner */}
        <View style={styles.celebrationRow}>
          <View style={styles.sparkleIcon}>
            <Ionicons name="sparkles" size={16} color="#A855F7" />
          </View>
          <Text style={styles.celebrationTitle}>Your video is ready 🎉</Text>
        </View>

        {/* Video Player Preview Area */}
        <View style={[styles.playerContainer, Shadows.glow]}>
          <Pressable onPress={handlePlayToggle} style={styles.mediaWrap}>
            <Image
              source={{ uri: video.thumbnailUrl }}
              style={styles.thumbnailImage}
              contentFit="cover"
              transition={200}
            />
            <LinearGradient
              colors={['rgba(9, 10, 15, 0.4)', 'transparent', 'rgba(9, 10, 15, 0.85)']}
              style={styles.playerVignette}
            />

            {/* Play / Pause Overlay */}
            <View style={styles.playCenterButton}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={34}
                color="#FFFFFF"
                style={{ marginLeft: isPlaying ? 0 : 4 }}
              />
            </View>

            {/* Top Bar Badges */}
            <View style={styles.playerTopBar}>
              <View style={styles.hdBadge}>
                <Text style={styles.hdBadgeText}>{video.resolution}</Text>
              </View>

              <View style={styles.ratioBadge}>
                <Text style={styles.ratioBadgeText}>{video.aspectRatio}</Text>
              </View>
            </View>

            {/* Bottom Scrubber Bar */}
            <View style={styles.playerControlsBar}>
              <View style={styles.timelineTrack}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.timelineProgress,
                    { width: isPlaying ? '65%' : '0%' },
                  ]}
                />
              </View>

              <View style={styles.timelineTimeRow}>
                <Text style={styles.timeCodeText}>
                  {isPlaying ? '0:38' : '0:00'}
                </Text>
                <Text style={styles.timeCodeText}>{video.duration}</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Video Metadata Section */}
        <View style={styles.metaSection}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text style={styles.promptSummary}>"{video.prompt}"</Text>

          {/* Details Card */}
          <Card style={styles.detailsCard} padding={16}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#A855F7" />
                <View>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>{video.duration}</Text>
                </View>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailItem}>
                <Ionicons name="film-outline" size={16} color="#A855F7" />
                <View>
                  <Text style={styles.detailLabel}>Style</Text>
                  <Text style={styles.detailValue}>{video.style}</Text>
                </View>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color="#A855F7" />
                <View>
                  <Text style={styles.detailLabel}>Created</Text>
                  <Text style={styles.detailValue}>{video.date}</Text>
                </View>
              </View>
            </View>

            <View style={styles.secondDetailRow}>
              <View style={styles.tagPill}>
                <Ionicons name="mic-outline" size={12} color="#A855F7" />
                <Text style={styles.tagPillText}>{video.voice}</Text>
              </View>
              <View style={styles.tagPill}>
                <Ionicons name="videocam-outline" size={12} color="#A855F7" />
                <Text style={styles.tagPillText}>{video.camera}</Text>
              </View>
              <View style={styles.tagPill}>
                <Ionicons name="folder-outline" size={12} color="#A855F7" />
                <Text style={styles.tagPillText}>{video.fileSize}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Primary Action Buttons: Play, Download, Share */}
        <View style={styles.actionsGroup}>
          <View style={styles.primaryActionsRow}>
            <View style={{ flex: 1 }}>
              <Button
                label={isPlaying ? 'Pause Video' : 'Play Video'}
                variant={isPlaying ? 'secondary' : 'gradient'}
                iconName={isPlaying ? 'pause' : 'play'}
                onPress={handlePlayToggle}
                fullWidth
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label={downloadProgress !== null ? `Saving ${downloadProgress}%` : 'Download'}
                variant="secondary"
                iconName="download-outline"
                isLoading={downloadProgress !== null}
                onPress={handleDownload}
                fullWidth
              />
            </View>
          </View>

          <Button
            label="Share Video"
            variant="outline"
            iconName="share-social-outline"
            onPress={handleShare}
            fullWidth
          />
        </View>

        {/* Secondary Actions */}
        <View style={styles.secondaryActionsGroup}>
          <Button
            label="Create Another Video"
            variant="primary"
            iconName="sparkles"
            onPress={handleCreateAnother}
            fullWidth
            size="lg"
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBackToLibrary}
            style={styles.saveToLibraryBtn}>
            <Ionicons name="albums-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.saveToLibraryText}>
              {isSaved ? 'Saved to My Videos ✓' : 'Save to My Videos'}
            </Text>
          </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.huge,
    gap: 16,
  },
  shareIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#161A28',
    borderWidth: 1,
    borderColor: '#262E44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sparkleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  playerContainer: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: '#090A0F',
    borderWidth: 1.5,
    borderColor: '#252B42',
  },
  mediaWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  playerVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playCenterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(15, 18, 30, 0.85)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  playerTopBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hdBadge: {
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hdBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  ratioBadge: {
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ratioBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  playerControlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(9, 10, 15, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timelineTrack: {
    height: 4,
    backgroundColor: '#1E2436',
    borderRadius: 2,
    overflow: 'hidden',
  },
  timelineProgress: {
    height: '100%',
  },
  timelineTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeCodeText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
  metaSection: {
    gap: 8,
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  promptSummary: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  detailsCard: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  detailDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1E2436',
  },
  secondDetailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E2436',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0C0E16',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1D2336',
  },
  tagPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actionsGroup: {
    gap: 10,
    marginTop: 4,
  },
  primaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryActionsGroup: {
    gap: 12,
    marginTop: 8,
  },
  saveToLibraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  saveToLibraryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
