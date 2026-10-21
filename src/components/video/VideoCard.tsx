import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { VideoItem } from '@/data/mockVideos';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

interface VideoCardProps {
  video: VideoItem;
  layout?: 'grid' | 'horizontal' | 'list';
  style?: ViewStyle;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  layout = 'grid',
  style,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/video/${video.id}`);
  };

  const isFailed = video.status === 'failed';
  const isProcessing = video.status === 'processing';

  if (layout === 'horizontal') {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.horizontalCard,
          Shadows.subtle,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          style,
        ]}>
        <View style={styles.horizontalThumbWrap}>
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={styles.horizontalThumb}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={['transparent', 'rgba(9, 10, 15, 0.85)']}
            style={styles.thumbVignette}
          />
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
          {!isFailed && !isProcessing && (
            <View style={styles.playOverlaySmall}>
              <Ionicons name="play" size={13} color="#FFF" style={{ marginLeft: 2 }} />
            </View>
          )}
        </View>

        <View style={styles.horizontalInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, getStatusBadgeStyle(video.status)]}>
              <Text style={styles.statusText}>
                {video.status === 'completed' ? 'Ready' : video.status === 'processing' ? 'Generating' : 'Failed'}
              </Text>
            </View>
            <Text style={styles.styleBadgeText}>{video.style}</Text>
          </View>

          <Text style={styles.horizontalTitle} numberOfLines={2}>
            {video.title}
          </Text>

          <Text style={styles.dateText}>{video.date}</Text>
        </View>
      </Pressable>
    );
  }

  // Grid layout (for 2-column library)
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.gridCard,
        Shadows.card,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        style,
      ]}>
      <View style={styles.gridThumbWrap}>
        <Image
          source={{ uri: video.thumbnailUrl }}
          style={styles.gridThumb}
          contentFit="cover"
          transition={250}
        />
        <LinearGradient
          colors={['rgba(9,10,15,0.2)', 'transparent', 'rgba(9,10,15,0.9)']}
          style={styles.thumbVignette}
        />
        
        {/* Duration badge */}
        <View style={styles.durationPill}>
          <Ionicons name="time-outline" size={10} color="#FFF" style={{ marginRight: 3 }} />
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>

        {/* Play Icon Badge */}
        {!isFailed && !isProcessing && (
          <View style={styles.playCenterPill}>
            <Ionicons name="play" size={16} color="#FFF" style={{ marginLeft: 2 }} />
          </View>
        )}

        {/* Status Indicator */}
        <View style={[styles.statusBadgeTop, getStatusBadgeStyle(video.status)]}>
          <Text style={styles.statusText}>
            {video.status === 'completed' ? 'Ready' : video.status === 'processing' ? 'Generating' : 'Failed'}
          </Text>
        </View>
      </View>

      <View style={styles.gridBody}>
        <Text style={styles.gridTitle} numberOfLines={1}>
          {video.title}
        </Text>
        
        <View style={styles.gridMetaRow}>
          <Text style={styles.gridStyleText}>{video.style}</Text>
          <Text style={styles.gridDot}>•</Text>
          <Text style={styles.gridDateText}>{video.date}</Text>
        </View>
      </View>
    </Pressable>
  );
};

function getStatusBadgeStyle(status: VideoItem['status']) {
  switch (status) {
    case 'completed':
      return { backgroundColor: 'rgba(16, 185, 129, 0.25)', borderColor: '#10B981', borderWidth: 1 };
    case 'processing':
      return { backgroundColor: 'rgba(245, 158, 11, 0.25)', borderColor: '#F59E0B', borderWidth: 1 };
    case 'failed':
      return { backgroundColor: 'rgba(239, 68, 68, 0.25)', borderColor: '#EF4444', borderWidth: 1 };
  }
}

const styles = StyleSheet.create({
  gridCard: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#22283C',
    marginBottom: 14,
  },
  gridThumbWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
    backgroundColor: '#090A0F',
  },
  gridThumb: {
    width: '100%',
    height: '100%',
  },
  thumbVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playCenterPill: {
    position: 'absolute',
    alignSelf: 'center',
    top: '32%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 18, 30, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Shadows.subtle,
  },
  durationPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  durationText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadgeTop: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridBody: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  gridMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  gridStyleText: {
    fontSize: 11,
    color: '#A855F7',
    fontWeight: '700',
  },
  gridDot: {
    fontSize: 10,
    color: Colors.textMuted,
    marginHorizontal: 4,
  },
  gridDateText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  // Horizontal layout
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#22283C',
    width: 285,
    overflow: 'hidden',
    marginRight: 14,
  },
  horizontalThumbWrap: {
    width: 105,
    height: 98,
    position: 'relative',
    backgroundColor: '#090A0F',
  },
  horizontalThumb: {
    width: '100%',
    height: '100%',
  },
  playOverlaySmall: {
    position: 'absolute',
    top: '32%',
    left: '32%',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  styleBadgeText: {
    fontSize: 11,
    color: '#A855F7',
    fontWeight: '600',
  },
  horizontalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 17,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
