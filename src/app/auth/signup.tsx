import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

const CREATOR_ROLES = [
  { id: 'filmmaker', label: 'AI Filmmaker', icon: 'film-outline' },
  { id: 'creator', label: 'Content Creator', icon: 'logo-youtube' },
  { id: 'marketer', label: 'Marketer / Ads', icon: 'megaphone-outline' },
  { id: 'business', label: 'Business Owner', icon: 'briefcase-outline' },
  { id: 'artist', label: 'Digital Artist', icon: 'color-palette-outline' },
];

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, continueAsGuest } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('creator');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleSignUp = async () => {
    triggerHaptic();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your name or creator handle.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const roleLabel = CREATOR_ROLES.find((r) => r.id === selectedRole)?.label;
      await signUp(trimmedName, trimmedEmail, password, roleLabel);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialMock = (provider: string) => {
    triggerHaptic();
    Alert.alert(
      `${provider} Sign-Up`,
      `In this preview, fill out your name & email or tap "Guest Mode" in the top corner to test immediately.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.replace('/auth/login')}
              style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={async () => {
                triggerHaptic();
                await continueAsGuest();
                router.replace('/(tabs)');
              }}
              style={styles.guestPill}>
              <Text style={styles.guestPillText}>Guest Mode</Text>
            </TouchableOpacity>
          </View>

          {/* Logo & Headline */}
          <View style={styles.brandHero}>
            <View style={[styles.logoWrap, Shadows.glow]}>
              <Image
                source={require('../../../assets/images/lazanicon.png')}
                style={styles.logoImage}
                contentFit="cover"
              />
            </View>
            <Text style={styles.welcomeTitle}>Create Creator Account</Text>
            <Text style={styles.welcomeSubtitle}>
              Join over 25,000 creators turning visions into cinematic video.
            </Text>
          </View>

          {/* 100 Credits Bonus Card */}
          <View style={[styles.bonusCard, Shadows.hover]}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.25)', 'rgba(99, 102, 241, 0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bonusGradient}>
              <View style={styles.bonusIconWrap}>
                <Ionicons name="gift" size={20} color="#34D399" />
              </View>
              <View style={styles.bonusTextWrap}>
                <Text style={styles.bonusTitle}>🎁 100 Free AI Credits Included</Text>
                <Text style={styles.bonusSubtitle}>
                  Ready to render up to 4 high-definition video scenes immediately.
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>FULL NAME OR STUDIO HANDLE</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alex Rivera or CyberFilms"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    setErrorMessage(null);
                  }}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="alex@creator.studio"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setErrorMessage(null);
                  }}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CREATE PASSWORD (6+ CHARACTERS)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    setErrorMessage(null);
                  }}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Creator Focus Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PRIMARY CREATOR FOCUS</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rolesRow}>
                {CREATOR_ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <TouchableOpacity
                      key={role.id}
                      activeOpacity={0.75}
                      onPress={() => {
                        triggerHaptic();
                        setSelectedRole(role.id);
                      }}
                      style={[
                        styles.rolePill,
                        isSelected && styles.rolePillActive,
                      ]}>
                      <Ionicons
                        name={role.icon as any}
                        size={14}
                        color={isSelected ? '#FFFFFF' : Colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.rolePillText,
                          isSelected && styles.rolePillTextActive,
                        ]}>
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Sign Up Primary CTA */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={isLoading}
              style={[styles.signupButton, isLoading && styles.buttonDisabled]}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signupGradient}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.signupButtonText}>Create Account & Claim 100 Credits</Text>
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By signing up, you agree to Lazan's Terms of Service and Privacy Policy.
            </Text>
          </View>

          {/* Social Sign Up */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleSocialMock('Apple')}
              style={styles.socialButton}>
              <Ionicons name="logo-apple" size={19} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleSocialMock('Google')}
              style={styles.socialButton}>
              <Ionicons name="logo-google" size={18} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View style={styles.bottomLinkRow}>
            <Text style={styles.bottomLinkMuted}>Already have an account?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.replace('/auth/login')}>
              <Text style={styles.bottomLinkAction}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  guestPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
  },
  bonusCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginBottom: Spacing.lg,
  },
  bonusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  bonusIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusTextWrap: {
    flex: 1,
  },
  bonusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#34D399',
    marginBottom: 2,
  },
  bonusSubtitle: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: '#FCA5A5',
    flex: 1,
  },
  formContainer: {
    gap: 15,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: Colors.textMuted,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 6,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rolePillActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: Colors.primary,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  rolePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  signupButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: 6,
    ...Shadows.glow,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
  },
  signupButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xl,
  },
  bottomLinkMuted: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bottomLinkAction: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
});
