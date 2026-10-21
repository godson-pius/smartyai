import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Shadows } from '@/constants/theme';

export interface FloatingGlassTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  insets?: any;
}

export const FloatingGlassTabBar: React.FC<FloatingGlassTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const bottomOffset = insets.bottom > 0 ? insets.bottom + 4 : 16;

  return (
    <View style={[styles.outerWrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.floatingContainer}>
        {/* Frosted Glass Background with Specular Gradient */}
        <LinearGradient
          colors={['rgba(22, 26, 42, 0.94)', 'rgba(11, 13, 21, 0.97)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.glassBackground}>
          {/* Subtle Top Specular Highlight Line */}
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.25)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.specularLine}
          />

          <View style={styles.tabsRow}>
            {state.routes.map((route: any, index: number) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;
              const isCreate = route.name === 'create';

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              // Special Center "Create" Button with Lazan Brand Icon
              if (isCreate) {
                return (
                  <TouchableOpacity
                    key={route.key}
                    activeOpacity={0.85}
                    onPress={onPress}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    style={styles.createButtonWrapper}>
                    <View
                      style={[
                        styles.createIconWrapper,
                        isFocused && styles.createIconWrapperActive,
                      ]}>
                      <Image
                        source={require('@/assets/images/lazanicon.png')}
                        style={styles.lazanTabIcon}
                        contentFit="cover"
                      />
                    </View>
                    <Text
                      style={[
                        styles.createLabel,
                        isFocused && styles.createLabelActive,
                      ]}>
                      Create
                    </Text>
                  </TouchableOpacity>
                );
              }

              // Standard Navigation Tab Icons
              let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';
              let label = 'Tab';

              if (route.name === 'index') {
                iconName = isFocused ? 'home' : 'home-outline';
                label = 'Home';
              } else if (route.name === 'videos') {
                iconName = isFocused ? 'film' : 'film-outline';
                label = 'Videos';
              } else if (route.name === 'profile') {
                iconName = isFocused ? 'person' : 'person-outline';
                label = 'Profile';
              }

              return (
                <TouchableOpacity
                  key={route.key}
                  activeOpacity={0.7}
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  style={styles.tabItem}>
                  <View
                    style={[
                      styles.iconCapsule,
                      isFocused && styles.iconCapsuleFocused,
                    ]}>
                    <Ionicons
                      name={iconName}
                      size={20}
                      color={isFocused ? '#A855F7' : '#64748B'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.tabLabel,
                      isFocused && styles.tabLabelFocused,
                    ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 99,
  },
  floatingContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    // Deep dark elevation shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65,
    shadowRadius: 24,
    elevation: 14,
  },
  glassBackground: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    position: 'relative',
  },
  specularLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    minWidth: 64,
  },
  iconCapsule: {
    width: 38,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconCapsuleFocused: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  tabLabelFocused: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  createButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  createIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
    ...Shadows.glow,
  },
  createIconWrapperActive: {
    borderColor: '#C4B5FD',
    borderWidth: 1.5,
    transform: [{ scale: 1.06 }],
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  lazanTabIcon: {
    width: '100%',
    height: '100%',
  },
  createLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 3,
  },
  createLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
