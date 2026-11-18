import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GameStateManager from '../models/GameStateManager';
import type { RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'LevelComplete'>;

export default function LevelCompleteView() {
  const navigation = useNavigation<NavProp>();
  const gsm = GameStateManager.instance;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LEVEL {gsm.currentLevel - 1}</Text>
      <Text style={styles.subtitle}>COMPLETE!</Text>
      <Text style={styles.stat}>Score: {gsm.score}</Text>
      <Text style={styles.stat}>Lives: {gsm.lives}</Text>
      <Pressable style={styles.button} onPress={() => navigation.replace('Game')}>
        <Text style={styles.buttonText}>NEXT LEVEL ({gsm.currentLevel})</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#0F0', fontSize: 48, fontWeight: 'bold' },
  subtitle: { color: '#0F0', fontSize: 36, fontWeight: 'bold', marginBottom: 30 },
  stat: { color: '#fff', fontSize: 20, marginVertical: 4 },
  button: { marginTop: 30, paddingVertical: 14, paddingHorizontal: 30, borderWidth: 2, borderColor: '#0F0' },
  buttonText: { color: '#0F0', fontSize: 20, fontWeight: 'bold' },
});
