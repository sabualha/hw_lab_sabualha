/**
 * App.tsx
 * -------
 * Root of the app. LocationProvider wraps the NavigationContainer so both
 * the Home and Map screens share the same live saved coordinate.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LocationProvider } from './viewModels/LocationContext';
import HomeView from './views/HomeView';
import MapViewScreen from './views/MapView';
import type { RootStackParamList } from './types';

/** Typed stack navigator built from our RootStackParamList. */
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root component: sets up the location context and the two-screen stack.
 * @returns The full app tree.
 */
export default function App() {
  return (
    <LocationProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeView} options={{ title: 'Find My Car' }} />
          <Stack.Screen name="Map" component={MapViewScreen} options={{ title: 'Map View' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </LocationProvider>
  );
}
