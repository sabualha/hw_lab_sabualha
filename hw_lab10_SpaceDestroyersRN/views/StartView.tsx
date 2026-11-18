import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GameStateManager from '../models/GameStateManager';
import type { RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Start'>;

export default function StartView() {
  const navigation = useNavigation<NavProp>();

  const onStart = () => {
    GameStateManager.instance.resetGame();
    navigation.navigate('Game');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SPACE</Text>
      <Text style={styles.title}>DESTROYERS</Text>
      <Pressable style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>START GAME</Text>
      </Pressable>
      <Text style={styles.tip}>Tilt to move · Tap to fire</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#0F0', fontSize: 48, fontWeight: 'bold' },
  button: { marginTop: 40, paddingVertical: 14, paddingHorizontal: 30, borderWidth: 2, borderColor: '#0F0' },
  buttonText: { color: '#0F0', fontSize: 20, fontWeight: 'bold' },
  tip: { color: '#fff', marginTop: 30 },
});
