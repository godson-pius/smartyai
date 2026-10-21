import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '@/constants/theme';
import { Button } from './Button';

interface ErrorViewProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  retryLabel?: string;
  backLabel?: string;
  style?: ViewStyle;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  onGoBack,
  retryLabel = 'Try Again',
  backLabel = 'Go Back',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.actionsRow}>
        {onGoBack && (
          <Button
            label={backLabel}
            variant="secondary"
            onPress={onGoBack}
            style={{ minWidth: 120 }}
          />
        )}
        {onRetry && (
          <Button
            label={retryLabel}
            variant="primary"
            iconName="refresh"
            onPress={onRetry}
            style={{ minWidth: 120 }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
