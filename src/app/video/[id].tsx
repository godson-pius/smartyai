import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { Header } from '@/components/common/Header';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';

const DEFAULT_SAMPLE_VIDEO = 'https://test-videos.co.uk/vids/sintel/mp4/h264/1080/Sintel_1080_10s_5MB.mp4';

export default function VideoResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVideoById, deleteVideo, updateDraft } = useApp();

  const video = id ? getVideoById(id) : undefined;
  const rawVideoUri = video?.videoUrl || DEFAULT_SAMPLE_VIDEO;
  // Guard against any remaining broken commondatastorage URLs
  const videoUri = rawVideoUri.includes('commondatastorage.googleapis.com')
    ? DEFAULT_SAMPLE_VIDEO
    : rawVideoUri;

  // Initialize native video player with looping and audio enabled
  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = true;
  });

  const targetDuration =
    video?.durationSeconds && video.durationSeconds > 0
      ? video.durationSeconds
      : video?.duration?.includes('15')
      ? 15
      : video?.duration?.includes('5')
      ? 5
      : 10;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(targetDuration);
  const [isSaved, setIsSaved] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isWatermarkActive, setIsWatermarkActive] = useState(video?.watermarkLogo !== false);

  const currentSourceRef = useRef(videoUri);
  const isPlayingRef = useRef(false);
  const playbackSecondsRef = useRef(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSecondsRef.current = playbackSeconds;
  }, [playbackSeconds]);

  // Ensure native player stays set to loop seamlessly
  useEffect(() => {
    player.loop = true;
  }, [player, videoUri]);

  // Sync playback state from native player
  useEffect(() => {
    const playSub = player.addListener('playingChange', (event) => {
      // If the short video clip paused because it reached the end of the file,
      // but narrative timeline is still progressing (e.g. at 10s of 60s),
      // seamlessly loop and replay the video to keep visuals moving!
      if (!event.isPlaying && isPlayingRef.current && playbackSecondsRef.current < targetDuration) {
        player.replay();
      } else if (!event.isPlaying && playbackSecondsRef.current >= targetDuration) {
        setIsPlaying(false);
      }
    });

    const playToEndSub = player.addListener('playToEnd', () => {
      if (isPlayingRef.current && playbackSecondsRef.current < targetDuration) {
        player.replay();
      }
    });

    return () => {
      playSub.remove();
      playToEndSub.remove();
    };
  }, [player, targetDuration]);

  // Master narrative timeline ticker (syncs playback across the full video duration)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackSeconds((prev) => {
          const next = prev + 1;
          if (next >= targetDuration) {
            player.pause();
            setIsPlaying(false);
            return targetDuration;
          }
          // Seamless loop check: if player finished or is near end of clip before narrative ends
          if (player.duration > 0 && player.currentTime >= player.duration - 0.4) {
            player.replay();
          }
          return next;
        });
      }, 1000);
    } else if (timer) {
      clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, targetDuration, player]);

  // Update source asynchronously only if route video URL actually changed
  useEffect(() => {
    if (videoUri && videoUri !== currentSourceRef.current) {
      currentSourceRef.current = videoUri;
      player.replaceAsync(videoUri).catch((err) => {
        console.warn('Failed to switch video source:', err);
      });
    }
  }, [videoUri, player]);

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
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      if (playbackSeconds >= targetDuration) {
        setPlaybackSeconds(0);
        player.currentTime = 0;
      }
      player.play();
      setIsPlaying(true);
    }
  };

  const handleJumpToScene = (sceneIdx: number) => {
    const totalScenes = video?.scenes?.length || 1;
    const sceneSpan = targetDuration / totalScenes;
    const newSec = Math.floor(sceneIdx * sceneSpan);
    setPlaybackSeconds(newSec);
    if (!isPlaying) {
      player.play();
      setIsPlaying(true);
    }
  };

  const handleGenerateNextScene = (scene: any) => {
    player.pause();
    updateDraft({
      prompt: scene.visualDescription || scene.title,
      customScript: scene.narrationSnippet || '',
      mode: scene.narrationSnippet ? 'script' : 'prompt',
      durationId: '10s',
    });
    router.push('/generation');
  };

  const handleMuteToggle = () => {
    player.muted = !player.muted;
    setIsMuted(player.muted);
  };

  const handleDownload = async () => {
    if (downloadProgress !== null) return;
    if (!video) return;

    try {
      setDownloadProgress(10);

      // Web platform: trigger browser download
      if (Platform.OS === 'web') {
        if (typeof document !== 'undefined') {
          const a = document.createElement('a');
          a.href = videoUri;
          a.download = `${(video.title || 'lazan_video').replace(/[^a-z0-9_-]/gi, '_')}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        setDownloadProgress(100);
        setTimeout(() => setDownloadProgress(null), 800);
        Alert.alert('Download Started', 'Your video download has started in your browser.');
        return;
      }

      // Native platform (iOS / Android)
      setDownloadProgress(20);
      const permission = await MediaLibrary.requestPermissionsAsync();

      let localFilePath = videoUri;

      // If it's a remote URL or data URI, ensure we have a local cached file
      if (videoUri.startsWith('http://') || videoUri.startsWith('https://')) {
        setDownloadProgress(40);
        const fileName = `lazan_${video.id || Date.now()}.mp4`;
        const cacheTarget = `${FileSystem.cacheDirectory || ''}${fileName}`;
        const downloadRes = await FileSystem.downloadAsync(videoUri, cacheTarget);
        localFilePath = downloadRes.uri;
        setDownloadProgress(75);
      } else if (videoUri.startsWith('data:video/mp4;base64,')) {
        setDownloadProgress(40);
        const base64Data = videoUri.split('base64,')[1];
        const fileName = `lazan_${video.id || Date.now()}.mp4`;
        const cacheTarget = `${FileSystem.cacheDirectory || ''}${fileName}`;
        await FileSystem.writeAsStringAsync(cacheTarget, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        localFilePath = cacheTarget;
        setDownloadProgress(75);
      } else {
        setDownloadProgress(60);
      }

      // Save asset to user's Photo / Media library
      if (permission.granted) {
        setDownloadProgress(85);
        const asset = await MediaLibrary.createAssetAsync(localFilePath);

        try {
          const album = await MediaLibrary.getAlbumAsync('Lazan');
          if (!album) {
            await MediaLibrary.createAlbumAsync('Lazan', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
        } catch {
          // Non-fatal if album addition fails
        }

        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // Haptics optional
        }

        setDownloadProgress(100);
        setTimeout(() => {
          setDownloadProgress(null);
          Alert.alert(
            'Saved to Photos',
            'Your video has been saved directly to your phone camera roll.'
          );
        }, 300);
      } else {
        // Fallback to native system share/save sheet if camera roll permission wasn't granted
        setDownloadProgress(null);
        Alert.alert(
          'Photo Library Access Required',
          'Permission to access your Photos library was not granted. Would you like to save or export the video file using the system share sheet?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Save via Sheet',
              onPress: async () => {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(localFilePath);
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('[Download] Failed to save video:', error);
      setDownloadProgress(null);
      Alert.alert(
        'Save Failed',
        error?.message || 'Unable to save the video to your camera roll. Please check your storage and try again.'
      );
    }
  };

  const handleShare = async () => {
    try {
      if (Platform.OS !== 'web' && videoUri.startsWith('file://') && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(videoUri, {
          dialogTitle: `Share "${video?.title || 'Lazan Video'}"`,
        });
      } else {
        await Share.share({
          title: video?.title || 'Lazan AI Video',
          message: `Watch my AI-generated video "${video?.title || 'Lazan AI Video'}": ${video?.videoUrl || `https://lazan.ai/v/${video?.id}`}`,
        });
      }
    } catch (error) {
      // dismissed
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video from your library? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            player.pause();
            deleteVideo(video.id);
            router.replace('/(tabs)/videos');
          },
        },
      ]
    );
  };

  const handleCreateAnother = () => {
    player.pause();
    router.replace('/(tabs)/create');
  };

  const handleBackToLibrary = () => {
    player.pause();
    router.replace('/(tabs)/videos');
  };

  const totalSec = targetDuration;
  const progressPercent = Math.min(Math.round((playbackSeconds / totalSec) * 100), 100);
  const formattedPlaybackTime = `${Math.floor(playbackSeconds / 60)}:${(playbackSeconds % 60) < 10 ? '0' : ''}${playbackSeconds % 60}`;
  const formattedDurationTime = `${Math.floor(totalSec / 60)}:${(totalSec % 60) < 10 ? '0' : ''}${totalSec % 60}`;

  const isPortrait = video.aspectRatio === '9:16';
  const isSquare = video.aspectRatio === '1:1';
  const brandLogo =
    video?.brandAssets?.find((a) => a.type === 'logo') ||
    video?.brandAssets?.[0];

  const dynamicPlayerContainer = isPortrait
    ? { maxWidth: 330, width: '92%' as const, alignSelf: 'center' as const }
    : { width: '100%' as const };

  const dynamicMediaWrap = isPortrait
    ? { aspectRatio: 9 / 16 }
    : isSquare
    ? { aspectRatio: 1 }
    : { aspectRatio: 16 / 9 };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <Header
          title="Video Result"
          showBack
          onBack={handleBackToLibrary}
          rightAction={
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleDelete}
                style={styles.deleteIconButton}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleShare}
                style={styles.shareIconButton}>
                <Ionicons name="share-outline" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
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
          <Text style={styles.celebrationTitle}>Your video is ready</Text>
        </View>

        {/* Video Player Preview Area with Native Video & Audio Playback */}
        <View style={[styles.playerContainer, dynamicPlayerContainer, Shadows.glow]}>
          <Pressable onPress={handlePlayToggle} style={[styles.mediaWrap, dynamicMediaWrap]}>
            {/* Native Video Surface */}
            <VideoView
              player={player}
              style={styles.videoView}
              contentFit="cover"
              nativeControls={false}
            />

            {/* Poster thumbnail before playback begins */}
            {!isPlaying && playbackSeconds === 0 && (
              <Image
                source={{ uri: video.thumbnailUrl }}
                style={styles.thumbnailImage}
                contentFit="cover"
                transition={200}
              />
            )}

            <LinearGradient
              colors={['rgba(9, 10, 15, 0.45)', 'transparent', 'rgba(9, 10, 15, 0.85)']}
              style={styles.playerVignette}
              pointerEvents="none"
            />

            {/* Play Overlay Button (Hidden while playing for clear viewing) */}
            {!isPlaying && (
              <View style={styles.playCenterButton} pointerEvents="none">
                <Ionicons
                  name="play"
                  size={34}
                  color="#FFFFFF"
                  style={{ marginLeft: 4 }}
                />
              </View>
            )}

            {/* Top Bar Badges */}
            <View style={styles.playerTopBar}>
              <View style={styles.topBarLeft}>
                <View style={styles.hdBadge}>
                  <Text style={styles.hdBadgeText}>{video.resolution}</Text>
                </View>

                <View style={styles.ratioBadge}>
                  <Text style={styles.ratioBadgeText}>{video.aspectRatio}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {/* Brand Logo Toggle Pill */}
                {brandLogo && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsWatermarkActive((prev) => !prev)}
                    style={[
                      styles.watermarkToggleBadge,
                      isWatermarkActive && styles.watermarkToggleBadgeActive,
                    ]}>
                    <Ionicons
                      name={isWatermarkActive ? 'shield-checkmark' : 'shield-outline'}
                      size={13}
                      color={isWatermarkActive ? '#C084FC' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.watermarkToggleText,
                        isWatermarkActive && styles.watermarkToggleTextActive,
                      ]}>
                      Logo {isWatermarkActive ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Sound / Mute Toggle Pill */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleMuteToggle}
                  style={styles.audioBadge}>
                  <Ionicons
                    name={isMuted ? 'volume-mute' : 'volume-high'}
                    size={14}
                    color={isMuted ? '#EF4444' : '#FFFFFF'}
                  />
                  <Text style={styles.audioBadgeText}>{isMuted ? 'Muted' : 'Sound'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Brand Logo Watermark Overlay */}
            {brandLogo && isWatermarkActive && (
              <View style={styles.playerWatermark} pointerEvents="none">
                <Image
                  source={{ uri: brandLogo.uri }}
                  style={styles.playerWatermarkImage}
                  contentFit="contain"
                />
              </View>
            )}

            {/* Bottom Scrubber Bar */}
            <View style={styles.playerControlsBar} pointerEvents="none">
              <View style={styles.timelineTrack}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.timelineProgress,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>

              <View style={styles.timelineTimeRow}>
                <Text style={styles.timeCodeText}>
                  {formattedPlaybackTime}
                </Text>
                <Text style={styles.timeCodeText}>{formattedDurationTime}</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Video Metadata Section */}
        <View style={styles.metaSection}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text style={styles.promptSummary}>"{video.prompt}"</Text>

          {video.synopsis ? (
            <View style={styles.synopsisWrap}>
              <Text style={styles.synopsisText}>{video.synopsis}</Text>
            </View>
          ) : null}

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

          {/* Attached Brand & Event Assets Card */}
          {video.brandAssets && video.brandAssets.length > 0 ? (
            <Card style={styles.brandAssetsCard} padding={14}>
              <View style={styles.brandAssetsCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="business" size={15} color="#C084FC" />
                  <Text style={styles.brandAssetsTitle}>Brand & Event Assets</Text>
                </View>
                <View style={styles.brandAssetsCountBadge}>
                  <Text style={styles.brandAssetsCountText}>
                    {video.brandAssets.length} Attached
                  </Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, marginTop: 10 }}>
                {video.brandAssets.map((asset) => (
                  <View key={asset.id} style={styles.brandAssetItem}>
                    <Image
                      source={{ uri: asset.uri }}
                      style={styles.brandAssetThumb}
                      contentFit="cover"
                    />
                    <View style={styles.brandAssetMeta}>
                      <Text style={styles.brandAssetType}>{asset.type.toUpperCase()}</Text>
                      <Text numberOfLines={1} style={styles.brandAssetName}>
                        {asset.name}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </Card>
          ) : null}
        </View>

        {/* AI Screenplay & Storyboard Breakdown (Generated via Gemini 3.8 Flash) */}
        {video.narrationScript ? (
          <View style={styles.storyboardSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.directorPill}>
                <Ionicons name="sparkles" size={13} color="#C4B5FD" />
                <Text style={styles.directorPillText}>AI DIRECTOR PACKAGE</Text>
              </View>
              <Text style={styles.directorModelTag}>Powered by Lazan</Text>
            </View>

            {/* Voiceover Script Card */}
            {video.narrationScript ? (
              <Card style={styles.scriptCard} padding={16}>
                <View style={styles.scriptCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="mic" size={16} color="#A855F7" />
                    <Text style={styles.scriptCardTitle}>Full Voiceover Screenplay</Text>
                  </View>
                  <View style={styles.fullScriptBadge}>
                    <Text style={styles.fullScriptBadgeText}>
                      {video.narrationScript.trim().split(/\s+/).filter(Boolean).length} words • {video.duration}
                    </Text>
                  </View>
                </View>
                <Text selectable style={styles.narrationBody}>
                  "{video.narrationScript}"
                </Text>
              </Card>
            ) : null}

            {/* Scene-by-Scene Storyboard with Interactive Timeline Sync */}
            {video.scenes && video.scenes.length > 0 ? (
              <View style={styles.scenesContainer}>
                <View style={styles.scenesHeaderRow}>
                  <Text style={styles.scenesHeadline}>Cinematic Scene Breakdown</Text>
                  <Text style={styles.scenesCountBadge}>
                    {video.scenes.length} Scenes • Tap to jump
                  </Text>
                </View>

                {video.scenes.map((scene, idx) => {
                  const totalScenes = video.scenes?.length || 1;
                  const sceneSpan = targetDuration / totalScenes;
                  const sceneStart = Math.floor(idx * sceneSpan);
                  const sceneEnd = Math.floor((idx + 1) * sceneSpan);
                  const isCurrentScene =
                    isPlaying &&
                    playbackSeconds >= sceneStart &&
                    playbackSeconds < sceneEnd;
                  const formatTime = (sec: number) =>
                    `${Math.floor(sec / 60)}:${sec % 60 < 10 ? '0' : ''}${sec % 60}`;

                  return (
                    <TouchableOpacity
                      key={scene.sceneNumber}
                      activeOpacity={0.85}
                      onPress={() => handleJumpToScene(idx)}
                      style={[
                        styles.sceneCard,
                        isCurrentScene && styles.sceneCardActive,
                      ]}>
                      <View style={styles.sceneCardTop}>
                        <View
                          style={[
                            styles.sceneNumberBadge,
                            isCurrentScene && styles.sceneNumberBadgeActive,
                          ]}>
                          <Text
                            style={[
                              styles.sceneNumberText,
                              isCurrentScene && styles.sceneNumberTextActive,
                            ]}>
                            Scene {scene.sceneNumber}
                          </Text>
                        </View>

                        <View style={styles.sceneTimeBadge}>
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color={isCurrentScene ? '#C084FC' : '#64748B'}
                          />
                          <Text
                            style={[
                              styles.sceneTimeBadgeText,
                              isCurrentScene && { color: '#C084FC', fontWeight: '700' },
                            ]}>
                            {scene.timestamp ||
                              `${formatTime(sceneStart)} - ${formatTime(sceneEnd)}`}
                          </Text>
                        </View>

                        {isCurrentScene && (
                          <View style={styles.nowPlayingBadge}>
                            <View style={styles.nowPlayingDot} />
                            <Text style={styles.nowPlayingText}>PLAYING</Text>
                          </View>
                        )}

                        <View style={styles.shotTypeBadge}>
                          <Text style={styles.shotTypeBadgeText}>{scene.shotType}</Text>
                        </View>
                      </View>

                      <Text style={styles.sceneTitle}>{scene.title}</Text>
                      <Text style={styles.sceneDescription}>{scene.visualDescription}</Text>
                      <View style={styles.cameraRow}>
                        <Ionicons name="videocam-outline" size={13} color="#A855F7" />
                        <Text style={styles.cameraNote}>{scene.cameraMovement}</Text>
                      </View>
                      {scene.narrationSnippet ? (
                        <View style={styles.sceneNarrationRow}>
                          <Ionicons
                            name="chatbubble-ellipses-outline"
                            size={12}
                            color="#64748B"
                          />
                          <Text style={styles.sceneNarrationSnippet}>
                            "{scene.narrationSnippet}"
                          </Text>
                        </View>
                      ) : null}

                      {scene.sceneNumber > 1 && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleGenerateNextScene(scene)}
                          style={styles.generateSceneBtn}>
                          <LinearGradient
                            colors={['#6366F1', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.generateSceneGradient}>
                            <Ionicons name="sparkles" size={13} color="#FFFFFF" />
                            <Text style={styles.generateSceneBtnText}>
                              Generate Scene {scene.sceneNumber} (+10s Shot)
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Primary Action Buttons: Play/Pause, Sound Toggle, Download, Share */}
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
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleMuteToggle}
              style={[styles.soundControlButton, isMuted && styles.soundControlButtonMuted]}>
              <Ionicons
                name={isMuted ? 'volume-mute-outline' : 'volume-high-outline'}
                size={22}
                color={isMuted ? '#EF4444' : '#C4B5FD'}
              />
            </TouchableOpacity>
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
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
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050608',
  },
  videoView: {
    width: '100%',
    height: '100%',
    position: 'absolute',
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
    alignItems: 'center',
  },
  topBarLeft: {
    flexDirection: 'row',
    gap: 8,
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
    fontWeight: '800',
  },
  audioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  audioBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  playerControlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: 'rgba(9, 10, 15, 0.6)',
  },
  timelineTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  timelineProgress: {
    height: '100%',
    borderRadius: 2,
  },
  timelineTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeCodeText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
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
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  detailsCard: {
    marginTop: 4,
    backgroundColor: '#131622',
    borderWidth: 1,
    borderColor: '#23293D',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 4,
  },
  detailLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 1,
  },
  secondDetailRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  tagPillText: {
    fontSize: 11,
    color: '#C4B5FD',
    fontWeight: '600',
  },
  actionsGroup: {
    gap: 10,
    marginTop: 4,
  },
  primaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  soundControlButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundControlButtonMuted: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  secondaryActionsGroup: {
    marginTop: 8,
    gap: 12,
    alignItems: 'center',
  },
  saveToLibraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveToLibraryText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  synopsisWrap: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 2,
  },
  synopsisText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  storyboardSection: {
    marginTop: 8,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  directorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  directorPillText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  directorModelTag: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  scriptCard: {
    backgroundColor: '#111422',
    borderWidth: 1,
    borderColor: '#23293D',
  },
  scriptCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fullScriptBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  fullScriptBadgeText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  scriptCardTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  narrationBody: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  scenesContainer: {
    gap: 10,
    marginTop: 4,
  },
  scenesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scenesHeadline: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  scenesCountBadge: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  sceneCard: {
    backgroundColor: '#131622',
    borderWidth: 1.5,
    borderColor: '#1E2438',
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  sceneCardActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#18152B',
  },
  sceneCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sceneNumberBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sceneNumberBadgeActive: {
    backgroundColor: '#8B5CF6',
  },
  sceneNumberText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  sceneNumberTextActive: {
    color: '#FFFFFF',
  },
  sceneTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sceneTimeBadgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  nowPlayingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A855F7',
  },
  nowPlayingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C084FC',
  },
  nowPlayingText: {
    color: '#C084FC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  shotTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shotTypeBadgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  sceneTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sceneDescription: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
  cameraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  cameraNote: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  sceneNarrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  sceneNarrationSnippet: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
    flex: 1,
  },
  generateSceneBtn: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  generateSceneGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  generateSceneBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  playerWatermark: {
    position: 'absolute',
    top: 50,
    right: 12,
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  playerWatermarkImage: {
    width: 68,
    height: 32,
  },
  watermarkToggleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  watermarkToggleBadgeActive: {
    borderColor: 'rgba(192, 132, 252, 0.5)',
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
  },
  watermarkToggleText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  watermarkToggleTextActive: {
    color: '#C084FC',
  },
  brandAssetsCard: {
    marginTop: 12,
    backgroundColor: 'rgba(19, 21, 31, 0.75)',
    borderColor: 'rgba(192, 132, 252, 0.25)',
  },
  brandAssetsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandAssetsTitle: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '700',
  },
  brandAssetsCountBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  brandAssetsCountText: {
    color: '#C084FC',
    fontSize: 11,
    fontWeight: '700',
  },
  brandAssetItem: {
    width: 88,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandAssetThumb: {
    width: 88,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  brandAssetMeta: {
    padding: 6,
    gap: 2,
  },
  brandAssetType: {
    color: '#C084FC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandAssetName: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
});
