import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { VIDEO_STYLES, VideoStyle } from '@/data/styles';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

interface StyleSelectorProps {
  selectedStyleId: string;
  onSelectStyle: (styleId: string) => void;
  style?: ViewStyle;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyleId,
  onSelectStyle,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {VIDEO_STYLES.map((item: VideoStyle) => {
          const isSelected = item.id === selectedStyleId;

          return (
            <Pressable
              key={item.id}
              onPress={() => onSelectStyle(item.id)}
              style={({ pressed }) => [
                styles.itemCard,
                isSelected && styles.itemCardSelected,
                pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
              ]}>
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.iconBackground, isSelected && Shadows.glow]}>
                <Ionicons
                  name={item.iconName as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>

              <Text
                style={[
                  styles.itemTitle,
                  isSelected && styles.itemTitleSelected,
                ]}
                numberOfLines={1}>
                {item.name}
              </Text>

              {isSelected && (
                <View style={styles.selectedCheckPill}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 10,
    paddingVertical: 4,
  },
  itemCard: {
    width: 104,
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#22283C',
    position: 'relative',
  },
  itemCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    ...Shadows.hover,
  },
  iconBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  itemTitleSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  selectedCheckPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
