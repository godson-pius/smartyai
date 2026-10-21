import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Switch,
  LayoutAnimation,
  Platform,
  UIManager,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CAMERA_STYLES, ASPECT_RATIOS, MOOD_OPTIONS } from '@/data/advancedOptions';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AdvancedOptionsProps {
  selectedCamera: string;
  selectedAspectRatio: string;
  selectedMood: string;
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  onSelectCamera: (camera: string) => void;
  onSelectAspectRatio: (ratio: string) => void;
  onSelectMood: (mood: string) => void;
  onToggleMusic: (val: boolean) => void;
  onToggleSoundEffects: (val: boolean) => void;
  style?: ViewStyle;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  selectedCamera,
  selectedAspectRatio,
  selectedMood,
  musicEnabled,
  soundEffectsEnabled,
  onSelectCamera,
  onSelectAspectRatio,
  onSelectMood,
  onToggleMusic,
  onToggleSoundEffects,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header Toggle */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleExpand}
        style={styles.headerButton}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="options-outline" size={18} color="#A855F7" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Advanced Director Controls</Text>
            <Text style={styles.headerSubtitle}>
              Camera angles, framing, mood & sound
            </Text>
          </View>
        </View>

        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.contentBody}>
          {/* Aspect Ratio */}
          <Text style={styles.subLabel}>ASPECT RATIO</Text>
          <View style={styles.aspectGrid}>
            {ASPECT_RATIOS.map((item) => {
              const isSelected = selectedAspectRatio === item.ratio;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSelectAspectRatio(item.ratio)}
                  style={({ pressed }) => [
                    styles.aspectCard,
                    isSelected && styles.aspectCardSelected,
                    pressed && { opacity: 0.9 },
                  ]}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={isSelected ? '#A855F7' : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.aspectLabel,
                      isSelected && styles.aspectLabelSelected,
                    ]}>
                    {item.label}
                  </Text>
                  <Text style={styles.aspectSublabel}>{item.sublabel}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Camera Styles */}
          <Text style={[styles.subLabel, { marginTop: 16 }]}>CAMERA MOVEMENT</Text>
          <View style={styles.chipWrap}>
            {CAMERA_STYLES.map((cam) => {
              const isSelected = selectedCamera === cam.name;
              return (
                <Pressable
                  key={cam.id}
                  onPress={() => onSelectCamera(cam.name)}
                  style={({ pressed }) => [
                    styles.chip,
                    isSelected && styles.chipSelected,
                    pressed && { opacity: 0.9 },
                  ]}>
                  <Ionicons
                    name={cam.icon as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={isSelected ? '#A855F7' : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}>
                    {cam.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Mood */}
          <Text style={[styles.subLabel, { marginTop: 16 }]}>EMOTIONAL MOOD</Text>
          <View style={styles.chipWrap}>
            {MOOD_OPTIONS.map((m) => {
              const isSelected = selectedMood === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => onSelectMood(m.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    isSelected && styles.chipSelected,
                    pressed && { opacity: 0.9 },
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}>
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Audio Toggles */}
          <View style={styles.togglesCard}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Ionicons name="musical-notes-outline" size={18} color="#A855F7" />
                <View>
                  <Text style={styles.switchTitle}>Adaptive Background Score</Text>
                  <Text style={styles.switchSubtitle}>Generates genre-matched musical soundtrack</Text>
                </View>
              </View>
              <Switch
                value={musicEnabled}
                onValueChange={onToggleMusic}
                trackColor={{ false: '#262E44', true: '#6D28D9' }}
                thumbColor={musicEnabled ? '#C084FC' : '#94A3B8'}
              />
            </View>

            <View style={[styles.switchRow, { marginTop: 12, borderTopWidth: 1, borderTopColor: '#22293E', paddingTop: 12 }]}>
              <View style={styles.switchInfo}>
                <Ionicons name="volume-high-outline" size={18} color="#A855F7" />
                <View>
                  <Text style={styles.switchTitle}>Foley & Spatial FX</Text>
                  <Text style={styles.switchSubtitle}>Atmospheric footsteps, wind, realistic acoustics</Text>
                </View>
              </View>
              <Switch
                value={soundEffectsEnabled}
                onValueChange={onToggleSoundEffects}
                trackColor={{ false: '#262E44', true: '#6D28D9' }}
                thumbColor={soundEffectsEnabled ? '#C084FC' : '#94A3B8'}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#22283C',
    overflow: 'hidden',
    marginVertical: 4,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  contentBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E2436',
    paddingTop: 14,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  aspectGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  aspectCard: {
    flex: 1,
    backgroundColor: '#0D0F18',
    borderRadius: BorderRadius.lg,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#20263A',
    alignItems: 'center',
    gap: 4,
  },
  aspectCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  aspectLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  aspectLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  aspectSublabel: {
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: '#0D0F18',
    borderWidth: 1,
    borderColor: '#20263A',
  },
  chipSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  togglesCard: {
    backgroundColor: '#0D0F18',
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#20263A',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  switchSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
});
