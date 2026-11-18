import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import StartView from './views/StartView';
import GameView from './views/GameView';
import LevelCompleteView from './views/LevelCompleteView';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Start" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Start" component={StartView} />
          <Stack.Screen name="Game" component={GameView} />
          <Stack.Screen name="LevelComplete" component={LevelCompleteView} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
