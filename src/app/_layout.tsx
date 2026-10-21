import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/context/AppContext';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen once ready
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="generation"
            options={{
              headerShown: false,
              presentation: 'card',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="video/[id]"
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="pricing"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="credits"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
