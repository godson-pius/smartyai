import { Header } from '@/components/common/Header';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { SUBSCRIPTION_PLANS } from '@/data/plans';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value?: string;
  badge?: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SETTINGS_SECTIONS: SettingSection[] = [
  {
    title: 'Studio Preferences',
    items: [
      { id: 'style', label: 'Default Video Style', icon: 'color-palette-outline', value: 'Cinematic' },
      { id: 'ratio', label: 'Default Aspect Ratio', icon: 'crop-outline', value: '9:16' },
      { id: 'voice', label: 'Voice Model', icon: 'mic-outline', value: 'Neural V2' },
      { id: 'notifications', label: 'Push Notifications', icon: 'notifications-outline', badge: 'Active' },
    ],
  },
  {
    title: 'Account & Security',
    items: [
      { id: 'account', label: 'Creator Profile', icon: 'person-outline' },
      { id: 'billing', label: 'Billing & Invoices', icon: 'card-outline' },
      { id: 'security', label: 'Two-Factor Authentication', icon: 'shield-checkmark-outline', badge: 'Enabled' },
    ],
  },
  {
    title: 'Support & Community',
    items: [
      { id: 'discord', label: 'Creator Community Discord', icon: 'logo-discord', value: '12k Members' },
      { id: 'help', label: 'Help & Knowledge Base', icon: 'help-circle-outline' },
      { id: 'privacy', label: 'Privacy & Terms', icon: 'document-text-outline' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, videos } = useApp();

  const currentPlanObj = SUBSCRIPTION_PLANS.find((p) => p.id === user.plan) || SUBSCRIPTION_PLANS[1];

  // Floating tab bar clearance
  const tabbarBottom = insets.bottom > 0 ? insets.bottom + 4 : 16;
  const tabbarHeight = 74;
  const bottomScrollPadding = tabbarBottom + tabbarHeight + 28;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your creator account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => Alert.alert('Signed out', 'Session cleared.') },
    ]);
  };

  const handleSettingPress = (id: string, label: string) => {
    if (id === 'billing') {
      router.push('/pricing');
      return;
    }
    Alert.alert(label, `${label} options can be configured here.`);
  };

  const creditPercentage = Math.round((user.creditsRemaining / user.totalCredits) * 100);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.headerWrap}>
        <Header
          title="Creator Studio"
          subtitle="Account & subscription"
          rightAction={
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/credits')}
              style={styles.headerCreditPill}>
              <Ionicons name="flash" size={13} color="#C4B5FD" />
              <Text style={styles.headerCreditText}>{user.creditsRemaining}</Text>
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomScrollPadding },
        ]}>
        {/* 1. CREATOR PROFILE HERO CARD */}
        <View style={styles.creatorCard}>
          {/* Subtle Specular Highlight */}
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.2)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.specularLine}
          />

          <View style={styles.creatorProfileRow}>
            {/* Glowing Avatar Ring */}
            <LinearGradient
              colors={['#6366F1', '#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradientRing}>
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            </LinearGradient>

            <View style={styles.creatorInfo}>
              <View style={styles.creatorNameRow}>
                <Text style={styles.creatorName}>{user.name}</Text>
                <View style={styles.creatorPlanBadge}>
                  <Ionicons name="sparkles" size={11} color="#C4B5FD" />
                  <Text style={styles.creatorPlanText}>{user.plan} Studio</Text>
                </View>
              </View>
              <Text style={styles.creatorEmail}>{user.email}</Text>
              <Text style={styles.creatorMemberId}>ID: LZ-99420-AI</Text>
            </View>
          </View>

          {/* Quick Studio Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{videos.length || 24}</Text>
              <Text style={styles.metricLabel}>Creations</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>18.5m</Text>
              <Text style={styles.metricLabel}>Rendered</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{user.creditsRemaining}</Text>
              <Text style={styles.metricLabel}>AI Credits</Text>
            </View>
          </View>
        </View>

        {/* 2. AI CREDITS & COMPUTE CARD (Responsive & Overflow-proof) */}
        <View style={styles.creditsCard}>
          {/* Subtle Top Specular */}
          <LinearGradient
            colors={['transparent', 'rgba(139, 92, 246, 0.35)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.specularLine}
          />

          <View style={styles.creditsTopRow}>
            {/* Left: Counter & Label */}
            <View style={styles.creditsLabelCol}>
              <View style={styles.creditsOverlineRow}>
                <View style={styles.creditsIconSmall}>
                  <Ionicons name="flash" size={12} color="#C4B5FD" />
                </View>
                <Text style={styles.creditsSectionOverline}>AI GENERATION CREDITS</Text>
              </View>

              <View style={styles.creditsNumberRow}>
                <Text style={styles.creditsLargeVal}>{user.creditsRemaining}</Text>
                <Text style={styles.creditsTotalVal}>/ {user.totalCredits} available</Text>
              </View>
            </View>

            {/* Right: Buy Credits Pill (Never overflows!) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/credits')}
              style={styles.buyCreditsButton}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buyCreditsGradient}>
                <Ionicons name="add-circle" size={15} color="#FFFFFF" />
                <Text style={styles.buyCreditsText}>Buy Credits</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.creditProgressTrack}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.creditProgressFill,
                { width: `${Math.max(6, Math.min(100, creditPercentage))}%` },
              ]}
            />
          </View>

          <View style={styles.progressFootRow}>
            <Text style={styles.progressSubtext}>Monthly quota renews on Oct 28</Text>
            <View style={styles.percentBadge}>
              <Text style={styles.percentBadgeText}>{creditPercentage}% Remaining</Text>
            </View>
          </View>
        </View>

        {/* 3. CURRENT MEMBERSHIP PLAN CARD */}
        <View style={styles.planCard}>
          {/* Subtle Top Specular */}
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.2)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.specularLine}
          />

          <View style={styles.planCardTopRow}>
            <View style={styles.planInfoBlock}>
              <Text style={styles.planSectionLabel}>MEMBERSHIP TIER</Text>
              <View style={styles.planTitleRow}>
                <Text style={styles.planNameText}>{currentPlanObj.name}</Text>
                <View style={styles.pricePill}>
                  <Text style={styles.pricePillText}>${currentPlanObj.priceMonthly}/mo</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/pricing')}
              style={styles.managePlanBtn}>
              <Text style={styles.managePlanBtnText}>Manage Plan</Text>
              <Ionicons name="chevron-forward" size={14} color="#C4B5FD" />
            </TouchableOpacity>
          </View>

          {/* Plan Feature Tags */}
          <View style={styles.featurePillsRow}>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.featurePillText}>{currentPlanObj.resolution}</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.featurePillText}>{currentPlanObj.maxDurationLabel}</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.featurePillText}>All 9 Styles</Text>
            </View>
          </View>
        </View>

        {/* 4. SETTINGS GROUPS */}
        {SETTINGS_SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.settingsGroup}>
            <Text style={styles.settingsGroupTitle}>{section.title}</Text>
            <View style={styles.settingsListCard}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => handleSettingPress(item.id, item.label)}
                  style={[
                    styles.settingsItemRow,
                    itemIdx < section.items.length - 1 && styles.settingsBorderBottom,
                  ]}>
                  <View style={styles.settingsItemLeft}>
                    <View style={styles.settingIconWrap}>
                      <Ionicons
                        name={item.icon as keyof typeof Ionicons.glyphMap}
                        size={17}
                        color="#A855F7"
                      />
                    </View>
                    <Text style={styles.settingItemLabel}>{item.label}</Text>
                  </View>

                  <View style={styles.settingsItemRight}>
                    {item.value && (
                      <Text style={styles.settingItemValue}>{item.value}</Text>
                    )}
                    {item.badge && (
                      <View style={styles.activeSettingBadge}>
                        <Text style={styles.activeSettingBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={15}
                      color="#64748B"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* 5. SIGN OUT BUTTON */}
        <View style={styles.signOutWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSignOut}
            style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={18} color="#F87171" />
            <Text style={styles.signOutText}>Sign Out of Studio</Text>
          </TouchableOpacity>
        </View>

        {/* Engine Footer */}
        <Text style={styles.versionFooter}>
          Lazan Neural Studio v1.2.0 • AI Engine SDK 57
        </Text>
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
  headerCreditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  headerCreditText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 4,
    gap: 16,
  },
  specularLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
  },
  // 1. HERO CREATOR CARD
  creatorCard: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#23293D',
    overflow: 'hidden',
    ...Shadows.card,
  },
  creatorProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarGradientRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  creatorName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  creatorPlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  creatorPlanText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C4B5FD',
  },
  creatorEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  creatorMemberId: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0D0F18',
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#1D2336',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1E253A',
  },
  // 2. AI CREDITS CARD (OVERFLOW PROOF)
  creditsCard: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(139, 92, 246, 0.28)',
    overflow: 'hidden',
    ...Shadows.card,
  },
  creditsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  creditsLabelCol: {
    flex: 1,
  },
  creditsOverlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creditsIconSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditsSectionOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  creditsNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 4,
  },
  creditsLargeVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  creditsTotalVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  buyCreditsButton: {
    flexShrink: 0,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.glow,
  },
  buyCreditsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.lg,
  },
  buyCreditsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  creditProgressTrack: {
    height: 6,
    backgroundColor: '#0D0F18',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#1D2338',
  },
  creditProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressFootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressSubtext: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  percentBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  percentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C4B5FD',
  },
  // 3. MEMBERSHIP PLAN CARD
  planCard: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#23293D',
    overflow: 'hidden',
    ...Shadows.card,
  },
  planCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  planInfoBlock: {
    flex: 1,
  },
  planSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  planNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pricePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pricePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  managePlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  managePlanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C4B5FD',
  },
  featurePillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0D0F18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#1D2336',
  },
  featurePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  // 4. SETTINGS GROUPS
  settingsGroup: {
    gap: 8,
  },
  settingsGroupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  settingsListCard: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#23293D',
    ...Shadows.card,
  },
  settingsItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  settingsBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#1A2033',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0D0F18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E253A',
  },
  settingItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingItemValue: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  activeSettingBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeSettingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  // 5. SIGN OUT BUTTON
  signOutWrapper: {
    marginTop: 6,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F87171',
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
