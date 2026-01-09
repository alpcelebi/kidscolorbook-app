import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../ui/screens/HomeScreen';
import { CategoryScreen } from '../ui/screens/CategoryScreen';
import { ColoringPageScreen } from '../ui/screens/ColoringPageScreen';
import { FreeDrawScreen } from '../ui/screens/FreeDrawScreen';
import { GalleryScreen } from '../ui/screens/GalleryScreen';
import { SettingsScreen } from '../ui/screens/SettingsScreen';
import { ParentDashboardScreen } from '../ui/screens/ParentDashboardScreen';
import { AchievementsScreen } from '../ui/screens/AchievementsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Category" component={CategoryScreen} />
        <Stack.Screen
          name="ColoringPage"
          component={ColoringPageScreen}
          options={{
            animation: 'slide_from_bottom',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="FreeDraw"
          component={FreeDrawScreen}
          options={{
            animation: 'slide_from_bottom',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
