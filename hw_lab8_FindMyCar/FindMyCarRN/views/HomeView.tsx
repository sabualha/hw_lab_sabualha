import React, { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLocation } from '../viewModels/LocationContext';
import { isValidCoordinate, formatCoordinate } from '../models/CarCoordinate';
import type { RootStackParamList } from '../types';

/** Typed navigation prop so navigation.navigate('Map') is checked by TypeScript. */
type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

/**
 * Home screen component.
 * @returns The title, status text, and the two action buttons.
 */
export default function HomeView() {
  const navigation = useNavigation<NavProp>();
  // Pull the shared coordinate and save function from the context
  const { coordinate, saveCurrentLocation } = useLocation();
  // True while we're waiting for a GPS fix (shows a spinner, blocks double taps)
  const [busy, setBusy] = useState(false);

  // Only consider a location "saved" if it's not the (0, 0) default
  const hasLocation = isValidCoordinate(coordinate);

  /**
   * Handler for the "Here's My Car" button. Saves the current location and
   * shows an alert with the result, or an error alert if something fails.
   * Ignores taps while a save is already in progress.
   */
  async function onSave() {
    if (busy) return;
    setBusy(true);
    try {
      const next = await saveCurrentLocation();
      Alert.alert(
        'Location Saved',
        `Your car is at:\n${formatCoordinate(next)}\n\nTap 'Where's My Car?' to view on the map.`,
      );
    } catch (error) {
      // Show the error's message if it's a real Error, otherwise a fallback
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Location Error', message);
    } finally {
      setBusy(false);
    }
  }

  /**
   * Handler for the "Where's My Car?" button. Navigates to the Map screen.
   */
  function onShowMap() {
    navigation.navigate('Map');
  }

  return (
    <View style={styles.container}>
      {/* Title + "Location Saved" subtitle (only shown once a location exists) */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>Find My Car</Text>
        {hasLocation && <Text style={styles.subtitle}>Location Saved</Text>}
      </View>

      {/* Save button – shows a spinner while fetching the location */}
      <Pressable style={[styles.button, styles.primary]} onPress={onSave} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="car" size={22} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Here's My Car</Text>
          </>
        )}
      </Pressable>

      {/* Map button – grey and disabled until a valid location is saved */}
      <Pressable
        style={[styles.button, hasLocation ? styles.success : styles.disabled]}
        onPress={onShowMap}
        disabled={!hasLocation}
      >
        <Ionicons name="map" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Where's My Car?</Text>
      </Pressable>
    </View>
  );
}

/** Styles for the Home screen. */
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 20 },
  titleBlock: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 34, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#34C759', marginTop: 6 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
  },
  primary: { backgroundColor: '#007AFF' },
  success: { backgroundColor: '#34C759' },
  disabled: { backgroundColor: '#a1a1a1' },
  icon: { marginRight: 8 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
