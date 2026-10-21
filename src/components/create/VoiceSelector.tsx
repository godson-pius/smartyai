import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VOICE_LANGUAGES, VOICE_STYLES, VoiceGender, VoiceStyle } from '@/data/voices';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

interface VoiceSelectorProps {
  gender: VoiceGender;
  voiceStyle: VoiceStyle;
  languageId: string;
  onSelectGender: (gender: VoiceGender) => void;
  onSelectVoiceStyle: (style: VoiceStyle) => void;
  onSelectLanguage: (languageId: string) => void;
  style?: ViewStyle;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  gender,
  voiceStyle,
  languageId,
  onSelectGender,
  onSelectVoiceStyle,
  onSelectLanguage,
  style,
}) => {
  const isNoVoice = voiceStyle === 'none';

  return (
    <View style={[styles.container, style]}>
      {/* 1. Voice Style (Narration, Dialogue, No Voice) */}
      <Text style={styles.sectionLabel}>VOICE DELIVERY</Text>
      <View style={styles.styleRow}>
        {VOICE_STYLES.map((vStyle) => {
          const isSelected = voiceStyle === vStyle.id;
          return (
            <Pressable
              key={vStyle.id}
              onPress={() => onSelectVoiceStyle(vStyle.id)}
              style={({ pressed }) => [
                styles.styleCard,
                isSelected && styles.styleCardSelected,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}>
              <View style={styles.styleCardInner}>
                <Ionicons
                  name={vStyle.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={isSelected ? '#A855F7' : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.styleCardText,
                    isSelected && styles.styleCardTextSelected,
                  ]}>
                  {vStyle.name}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {!isNoVoice && (
        <>
          {/* 2. Gender Selection */}
          <Text style={[styles.sectionLabel, { marginTop: 14 }]}>SPEAKER GENDER</Text>
          <View style={styles.genderRow}>
            {(['female', 'male'] as VoiceGender[]).map((g) => {
              const isSelected = gender === g;
              return (
                <Pressable
                  key={g}
                  onPress={() => onSelectGender(g)}
                  style={({ pressed }) => [
                    styles.genderButton,
                    isSelected && styles.genderButtonSelected,
                    pressed && { opacity: 0.9 },
                  ]}>
                  <Ionicons
                    name={g === 'female' ? 'woman-outline' : 'man-outline'}
                    size={16}
                    color={isSelected ? '#FFF' : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.genderText,
                      isSelected && styles.genderTextSelected,
                    ]}>
                    {g === 'female' ? 'Female Voice' : 'Male Voice'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 3. Language & Accent */}
          <Text style={[styles.sectionLabel, { marginTop: 14 }]}>LANGUAGE & ACCENT</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.langScroll}>
            {VOICE_LANGUAGES.map((lang) => {
              const isSelected = languageId === lang.id;
              return (
                <Pressable
                  key={lang.id}
                  onPress={() => onSelectLanguage(lang.id)}
                  style={({ pressed }) => [
                    styles.langChip,
                    isSelected && styles.langChipSelected,
                    pressed && { opacity: 0.9 },
                  ]}>
                  <Text style={styles.flagEmoji}>{lang.flag}</Text>
                  <View>
                    <Text
                      style={[
                        styles.langName,
                        isSelected && styles.langNameSelected,
                      ]}>
                      {lang.name}
                    </Text>
                    <Text style={styles.langSample}>{lang.sampleName}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  styleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  styleCard: {
    flex: 1,
    backgroundColor: '#121522',
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: '#22283C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  styleCardInner: {
    alignItems: 'center',
    gap: 5,
  },
  styleCardText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  styleCardTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#121522',
    borderWidth: 1.5,
    borderColor: '#22283C',
  },
  genderButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    ...Shadows.subtle,
  },
  genderText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  genderTextSelected: {
    color: '#FFF',
    fontWeight: '800',
  },
  langScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#121522',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#22283C',
  },
  langChipSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  flagEmoji: {
    fontSize: 18,
  },
  langName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  langNameSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  langSample: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
