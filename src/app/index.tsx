import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { Colors } from '@/constants/theme';

export default function RootIndex() {
  const { isLoaded, hasCompletedOnboarding, isAuthenticated } = useApp();

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/lazanicon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <ActivityIndicator size="small" color={Colors.primary} style={styles.spinner} />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 22,
  },
  spinner: {
    marginTop: 24,
  },
});
