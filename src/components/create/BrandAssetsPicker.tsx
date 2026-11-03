import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { BrandAsset } from '@/data/mockVideos';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

interface BrandAssetsPickerProps {
  assets: BrandAsset[];
  watermarkLogo: boolean;
  onAddAsset: (asset: BrandAsset) => void;
  onRemoveAsset: (id: string) => void;
  onToggleWatermark: (val: boolean) => void;
  onUpdateAssetType: (id: string, type: BrandAsset['type']) => void;
}

export const BrandAssetsPicker: React.FC<BrandAssetsPickerProps> = ({
  assets = [],
  watermarkLogo = true,
  onAddAsset,
  onRemoveAsset,
  onToggleWatermark,
  onUpdateAssetType,
}) => {
  const handlePickImages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Needed',
          'Please allow access to your photos so you can attach logos and event flyers.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 3,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        result.assets.forEach((asset, idx) => {
          const rawName = asset.fileName || `Asset_${idx + 1}`;
          const lower = rawName.toLowerCase();
          const autoType: BrandAsset['type'] = lower.includes('logo')
            ? 'logo'
            : lower.includes('flyer') || lower.includes('poster')
            ? 'flyer'
            : 'reference';

          onAddAsset({
            id: `asset-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            uri: asset.uri,
            name: rawName.length > 18 ? rawName.slice(0, 15) + '...' : rawName,
            type: autoType,
          });
        });
      }
    } catch (err: any) {
      console.warn('Image picker error:', err);
      Alert.alert('Upload Error', 'Could not access the selected photo. Please try again.');
    }
  };

  const hasLogo = assets.some((a) => a.type === 'logo');

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="business-outline" size={17} color="#C084FC" />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.title}>Brand & Event Assets</Text>
              <View style={styles.optionalBadge}>
                <Text style={styles.optionalBadgeText}>OPTIONAL</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>
              Attach firm logo, event flyer, or brand colors
            </Text>
          </View>
        </View>

        {assets.length > 0 && assets.length < 3 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePickImages}
            style={styles.addMoreMiniBtn}>
            <Ionicons name="add" size={16} color="#A855F7" />
            <Text style={styles.addMoreMiniText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Empty State: Upload Prompt */}
      {assets.length === 0 ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePickImages}
          style={styles.uploadDashedCard}>
          <View style={styles.uploadIconBadge}>
            <Ionicons name="cloud-upload-outline" size={20} color="#A855F7" />
          </View>
          <Text style={styles.uploadPromptTitle}>Attach Firm Logo or Event Flyer</Text>
          <Text style={styles.uploadPromptSub}>
            PNG, JPG or poster graphics to brand your video
          </Text>
        </TouchableOpacity>
      ) : (
        /* Attached Assets List */
        <View style={styles.assetsListContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.assetsScroll}>
            {assets.map((asset) => {
              const typeColor =
                asset.type === 'logo'
                  ? '#A855F7'
                  : asset.type === 'flyer'
                  ? '#3B82F6'
                  : '#10B981';

              const nextType: BrandAsset['type'] =
                asset.type === 'logo'
                  ? 'flyer'
                  : asset.type === 'flyer'
                  ? 'reference'
                  : 'logo';

              return (
                <View key={asset.id} style={styles.assetCard}>
                  {/* Thumbnail */}
                  <Image
                    source={{ uri: asset.uri }}
                    style={styles.assetThumb}
                    contentFit="cover"
                    transition={200}
                  />

                  {/* Remove Button */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onRemoveAsset(asset.id)}
                    style={styles.removeBtn}>
                    <Ionicons name="close" size={13} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Type Badge (Tap to toggle type) */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onUpdateAssetType(asset.id, nextType)}
                    style={[styles.typeBadge, { borderColor: typeColor }]}>
                    <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                      {asset.type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>

                  <Text numberOfLines={1} style={styles.assetName}>
                    {asset.name}
                  </Text>
                </View>
              );
            })}

            {assets.length < 3 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickImages}
                style={styles.uploadMiniCard}>
                <Ionicons name="add-circle-outline" size={24} color="#64748B" />
                <Text style={styles.uploadMiniText}>Add More</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Watermark Logo Switch if a logo is attached */}
          {hasLogo && (
            <View style={styles.watermarkRow}>
              <View style={styles.watermarkInfo}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#A855F7" />
                <View>
                  <Text style={styles.watermarkTitle}>Overlay Logo Watermark</Text>
                  <Text style={styles.watermarkSub}>
                    Embeds firm logo in top-right corner of video
                  </Text>
                </View>
              </View>
              <Switch
                value={watermarkLogo}
                onValueChange={onToggleWatermark}
                trackColor={{ false: '#262E44', true: '#7C3AED' }}
                thumbColor={watermarkLogo ? '#C084FC' : '#94A3B8'}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121522',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: '#23293D',
    padding: 14,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  optionalBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  optionalBadgeText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  addMoreMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  addMoreMiniText: {
    color: '#C084FC',
    fontSize: 11,
    fontWeight: '700',
  },
  uploadDashedCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#333D59',
    borderRadius: BorderRadius.lg,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 18, 30, 0.5)',
  },
  uploadIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadPromptTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  uploadPromptSub: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  assetsListContainer: {
    gap: 10,
  },
  assetsScroll: {
    gap: 10,
    paddingVertical: 2,
  },
  assetCard: {
    width: 90,
    backgroundColor: '#0A0C14',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#23293D',
    position: 'relative',
    paddingBottom: 6,
  },
  assetThumb: {
    width: 90,
    height: 75,
    backgroundColor: '#0F121E',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    alignSelf: 'flex-start',
    marginHorizontal: 5,
    marginTop: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  assetName: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 5,
    marginTop: 2,
  },
  uploadMiniCard: {
    width: 80,
    height: 108,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#2A334E',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 18, 30, 0.3)',
  },
  uploadMiniText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  watermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 18, 30, 0.6)',
    borderRadius: BorderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1F263C',
    marginTop: 2,
  },
  watermarkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  watermarkTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  watermarkSub: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
});

