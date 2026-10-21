import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingGlassTabBar } from '@/components/navigation/FloatingGlassTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'My Videos',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
