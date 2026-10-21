import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/common/Header';
import { StyleSelector } from '@/components/create/StyleSelector';
import { DurationSelector } from '@/components/create/DurationSelector';
import { AdvancedOptions } from '@/components/create/AdvancedOptions';
import { CreditBalance } from '@/components/common/CreditBalance';
import { Button } from '@/components/common/Button';
import { VIDEO_STYLES } from '@/data/styles';
import { DURATION_OPTIONS } from '@/data/plans';
import { VOICE_LANGUAGES, VOICE_STYLES, VoiceGender, VoiceStyle } from '@/data/voices';
import { ASPECT_RATIOS } from '@/data/advancedOptions';
import { PROMPT_SUGGESTIONS } from '@/data/advancedOptions';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    user,
    draft,
    updateDraft,
    improveDraftPrompt,
    calculateCost,
    canPlanAccessDuration,
  } = useApp();

  const [isImproving, setIsImproving] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const selectedStyle = VIDEO_STYLES.find((s) => s.id === draft.styleId) || VIDEO_STYLES[0];
  const selectedDuration = DURATION_OPTIONS.find((d) => d.id === draft.durationId) || DURATION_OPTIONS[1];
  const selectedLang = VOICE_LANGUAGES.find((l) => l.id === draft.languageId) || VOICE_LANGUAGES[0];

  const estimatedCredits = calculateCost(draft.durationId);
  const hasEnoughCredits = user.creditsRemaining >= estimatedCredits;

  // Floating tab bar offset: insets.bottom > 0 ? insets.bottom + 4 : 16
  // Tab bar height is ~74px. We float this generate dock safely 10px above the tab bar.
  const tabbarBottom = insets.bottom > 0 ? insets.bottom + 4 : 16;
  const tabbarHeight = 74;
  const bottomBarBottom = tabbarBottom + tabbarHeight + 10;

  const handleImproveIdea = () => {
    setIsImproving(true);
    improveDraftPrompt();
    setTimeout(() => {
      setIsImproving(false);
    }, 450);
  };

  const handleSelectSamplePrompt = (sample: string) => {
    updateDraft({ prompt: sample });
  };

  const handleGenerate = () => {
    if (!draft.prompt.trim()) {
      Alert.alert('Please describe your video', 'Type a prompt or tap one of our suggested ideas to get started.');
      return;
    }

    if (!hasEnoughCredits) {
      router.push('/credits');
      return;
    }

    router.push('/generation');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        {/* Top App Header */}
        <View style={styles.headerPadding}>
          <Header
            title="Create Video"
            subtitle="Text to Video Engine"
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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomBarBottom + 70 },
          ]}
          keyboardShouldPersistTaps="handled">
          
          {/* 1. HERO PROMPT CANVAS */}
          <View style={styles.canvasCard}>
            <TextInput
              style={styles.promptInput}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholder="Describe your video in detail... e.g. A cinematic scene of a young African entrepreneur walking through Kigali at sunset, golden hour light..."
              placeholderTextColor="#64748B"
              value={draft.prompt}
              onChangeText={(text) => updateDraft({ prompt: text })}
            />

            {/* Bottom Bar inside the Canvas */}
            <View style={styles.canvasFooter}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleImproveIdea}
                disabled={isImproving}
                style={styles.magicEnhanceButton}>
                <Ionicons name="sparkles" size={13} color="#C4B5FD" />
                <Text style={styles.magicEnhanceText}>
                  {isImproving ? 'Polishing prompt...' : '✨ Enhance Idea'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.characterCount}>
                {draft.prompt.length}/500
              </Text>
            </View>
          </View>

          {/* Quick Idea Inspiration Chips */}
          <View style={styles.inspirationSection}>
            <Text style={styles.inspirationLabel}>QUICK INSPIRATION</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
              {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => handleSelectSamplePrompt(suggestion)}
                  style={styles.suggestionChip}>
                  <Ionicons name="flash-outline" size={12} color="#A855F7" />
                  <Text style={styles.suggestionChipText} numberOfLines={1}>
                    {suggestion.split(',')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 2. VISUAL STYLE SELECTOR */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Visual Style</Text>
              <Text style={styles.selectedPillTag}>{selectedStyle.name}</Text>
            </View>
            <StyleSelector
              selectedStyleId={draft.styleId}
              onSelectStyle={(styleId) => updateDraft({ styleId })}
            />
          </View>

          {/* 3. FORMAT & AUDIO SETTINGS CARD */}
          <View style={styles.settingsGroupCard}>
            {/* Duration Segment */}
            <View style={styles.settingItemBlock}>
              <View style={styles.settingHeaderRow}>
                <View style={styles.settingTitleRow}>
                  <Ionicons name="timer-outline" size={16} color="#A855F7" />
                  <Text style={styles.settingBlockTitle}>Video Duration</Text>
                </View>
                <Text style={styles.settingCurrentValue}>{selectedDuration.label}</Text>
              </View>

              <DurationSelector
                selectedDurationId={draft.durationId}
                onSelectDuration={(durationId) => updateDraft({ durationId })}
                canAccessDuration={canPlanAccessDuration}
              />
            </View>

            {/* Aspect Ratio Segment */}
            <View style={[styles.settingItemBlock, styles.borderTopBlock]}>
              <View style={styles.settingHeaderRow}>
                <View style={styles.settingTitleRow}>
                  <Ionicons name="crop-outline" size={16} color="#A855F7" />
                  <Text style={styles.settingBlockTitle}>Aspect Ratio</Text>
                </View>
                <Text style={styles.settingCurrentValue}>{draft.aspectRatio}</Text>
              </View>

              <View style={styles.aspectRatioRow}>
                {ASPECT_RATIOS.map((item) => {
                  const isSelected = draft.aspectRatio === item.ratio;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => updateDraft({ aspectRatio: item.ratio })}
                      style={[
                        styles.aspectButton,
                        isSelected && styles.aspectButtonSelected,
                      ]}>
                      <Ionicons
                        name={item.icon as keyof typeof Ionicons.glyphMap}
                        size={16}
                        color={isSelected ? '#FFFFFF' : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.aspectButtonText,
                          isSelected && styles.aspectButtonTextSelected,
                        ]}>
                        {item.ratio}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Voice & Narration Quick Row */}
            <View style={[styles.settingItemBlock, styles.borderTopBlock]}>
              <View style={styles.settingHeaderRow}>
                <View style={styles.settingTitleRow}>
                  <Ionicons name="mic-outline" size={16} color="#A855F7" />
                  <Text style={styles.settingBlockTitle}>Voice & Narration</Text>
                </View>
                
                {draft.voiceStyle !== 'none' && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowVoiceModal(true)}
                    style={styles.voiceCustomizerPill}>
                    <Text style={styles.voiceCustomizerText}>
                      {draft.voiceGender === 'female' ? 'Female' : 'Male'} ({selectedLang.name.split(' ')[0]}) ▾
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Delivery mode pills */}
              <View style={styles.voiceDeliveryRow}>
                {VOICE_STYLES.map((vStyle) => {
                  const isSelected = draft.voiceStyle === vStyle.id;
                  return (
                    <TouchableOpacity
                      key={vStyle.id}
                      activeOpacity={0.8}
                      onPress={() => updateDraft({ voiceStyle: vStyle.id })}
                      style={[
                        styles.voicePill,
                        isSelected && styles.voicePillSelected,
                      ]}>
                      <Ionicons
                        name={vStyle.icon as keyof typeof Ionicons.glyphMap}
                        size={14}
                        color={isSelected ? '#FFFFFF' : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.voicePillText,
                          isSelected && styles.voicePillTextSelected,
                        ]}>
                        {vStyle.name === 'Character Dialogue' ? 'Dialogue' : vStyle.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* 4. OPTIONAL ADVANCED DIRECTOR CONTROLS */}
          <View style={styles.sectionBlock}>
            <AdvancedOptions
              selectedCamera={draft.cameraStyle}
              selectedAspectRatio={draft.aspectRatio}
              selectedMood={draft.mood}
              musicEnabled={draft.backgroundMusic}
              soundEffectsEnabled={draft.soundEffects}
              onSelectCamera={(cameraStyle) => updateDraft({ cameraStyle })}
              onSelectAspectRatio={(aspectRatio) => updateDraft({ aspectRatio })}
              onSelectMood={(mood) => updateDraft({ mood })}
              onToggleMusic={(backgroundMusic) => updateDraft({ backgroundMusic })}
              onToggleSoundEffects={(soundEffects) => updateDraft({ soundEffects })}
            />
          </View>

        </ScrollView>

        {/* 5. FLOATING GENERATION ACTION DOCK (Positioned safely above floating tab bar) */}
        <View
          style={[styles.bottomBarContainer, { bottom: bottomBarBottom }]}
          pointerEvents="box-none">
          <View style={styles.bottomBarCard}>
            {/* Subtle top specular highlight */}
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.22)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.specularHighlight}
            />

            <View style={styles.bottomBarInner}>
              {/* Left: Cost & user balance */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/credits')}
                style={styles.costInfoWrap}>
                <View style={styles.costPill}>
                  <Ionicons name="flash" size={13} color="#C4B5FD" />
                  <Text style={styles.costNumber}>{estimatedCredits}</Text>
                  <Text style={styles.costPillLabel}>Credits</Text>
                </View>
                <Text
                  style={[
                    styles.balanceSubtext,
                    !hasEnoughCredits && { color: '#F87171' },
                  ]}
                  numberOfLines={1}>
                  {hasEnoughCredits ? `${user.creditsRemaining} avail.` : 'Tap to top up'}
                </Text>
              </TouchableOpacity>

              {/* Right: Primary Generate Button */}
              <View style={styles.generateButtonWrap}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleGenerate}
                  style={styles.generateActionButton}>
                  <LinearGradient
                    colors={hasEnoughCredits ? ['#6366F1', '#8B5CF6', '#A855F7'] : ['#374151', '#1F2937']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.8 }}
                    style={styles.generateActionGradient}>
                    <Ionicons
                      name={hasEnoughCredits ? 'sparkles' : 'add-circle-outline'}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.generateActionText} numberOfLines={1}>
                      {hasEnoughCredits ? 'Generate Video' : 'Get Credits'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* VOICE MODAL (Clean voice customizer) */}
        <Modal
          visible={showVoiceModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowVoiceModal(false)}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowVoiceModal(false)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Speaker Voice & Dialect</Text>
                <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Gender selector */}
              <Text style={styles.modalSubheading}>GENDER</Text>
              <View style={styles.modalGenderRow}>
                {(['female', 'male'] as VoiceGender[]).map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => updateDraft({ voiceGender: g })}
                    style={[
                      styles.modalGenderBtn,
                      draft.voiceGender === g && styles.modalGenderBtnActive,
                    ]}>
                    <Ionicons
                      name={g === 'female' ? 'woman-outline' : 'man-outline'}
                      size={16}
                      color={draft.voiceGender === g ? '#FFF' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.modalGenderText,
                        draft.voiceGender === g && styles.modalGenderTextActive,
                      ]}>
                      {g === 'female' ? 'Female Voice' : 'Male Voice'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Dialects list */}
              <Text style={[styles.modalSubheading, { marginTop: 16 }]}>DIALECT & ACCENT</Text>
              <View style={styles.modalLangList}>
                {VOICE_LANGUAGES.map((lang) => {
                  const isSelected = draft.languageId === lang.id;
                  return (
                    <TouchableOpacity
                      key={lang.id}
                      onPress={() => {
                        updateDraft({ languageId: lang.id });
                        setShowVoiceModal(false);
                      }}
                      style={[
                        styles.modalLangRow,
                        isSelected && styles.modalLangRowSelected,
                      ]}>
                      <Text style={styles.modalLangFlag}>{lang.flag}</Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.modalLangName,
                            isSelected && styles.modalLangNameActive,
                          ]}>
                          {lang.name}
                        </Text>
                        <Text style={styles.modalLangSample}>{lang.sampleName}</Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#8B5CF6" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerPadding: {
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 4,
    gap: 16,
  },
  // 1. HERO PROMPT CANVAS
  canvasCard: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: '#23293D',
    padding: 16,
    ...Shadows.card,
  },
  promptInput: {
    minHeight: 96,
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  canvasFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1C2132',
    paddingTop: 12,
    marginTop: 8,
  },
  magicEnhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  magicEnhanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C4B5FD',
  },
  characterCount: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  inspirationSection: {
    gap: 6,
  },
  inspirationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111420',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#20263A',
  },
  suggestionChipText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  // 2. SECTIONS
  sectionBlock: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedPillTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C4B5FD',
  },
  // 3. SETTINGS GROUP CARD
  settingsGroupCard: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: '#22283C',
    padding: 16,
    gap: 14,
  },
  settingItemBlock: {
    gap: 8,
  },
  borderTopBlock: {
    borderTopWidth: 1,
    borderTopColor: '#1A1F30',
    paddingTop: 14,
  },
  settingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingBlockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingCurrentValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A855F7',
  },
  aspectRatioRow: {
    flexDirection: 'row',
    gap: 8,
  },
  aspectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#0D0F18',
    borderWidth: 1,
    borderColor: '#20263A',
  },
  aspectButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#1E1B4B',
  },
  aspectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  aspectButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  voiceCustomizerPill: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  voiceCustomizerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C4B5FD',
  },
  voiceDeliveryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  voicePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#0D0F18',
    borderWidth: 1,
    borderColor: '#20263A',
  },
  voicePillSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#1E1B4B',
  },
  voicePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  voicePillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // 5. FLOATING GENERATION ACTION BAR
  bottomBarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 95,
    alignItems: 'center',
  },
  bottomBarCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(18, 21, 34, 0.96)',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  specularHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  costInfoWrap: {
    flexShrink: 0,
    justifyContent: 'center',
  },
  costPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  costPillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C4B5FD',
  },
  balanceSubtext: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  generateButtonWrap: {
    flex: 1,
  },
  generateActionButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.glow,
  },
  generateActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.xl,
  },
  generateActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  // MODAL STYLING
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xxl,
    borderWidth: 1.5,
    borderColor: '#28314B',
    padding: 20,
    ...Shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSubheading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalGenderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalGenderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#0D0F18',
    borderWidth: 1,
    borderColor: '#20263A',
  },
  modalGenderBtnActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#1E1B4B',
  },
  modalGenderText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  modalGenderTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalLangList: {
    gap: 6,
  },
  modalLangRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#0D0F18',
    borderWidth: 1,
    borderColor: '#20263A',
  },
  modalLangRowSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#1E1B4B',
  },
  modalLangFlag: {
    fontSize: 18,
  },
  modalLangName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  modalLangNameActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalLangSample: {
    fontSize: 11,
    color: '#64748B',
  },
});
