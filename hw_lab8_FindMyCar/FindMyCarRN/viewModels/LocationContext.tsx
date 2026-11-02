import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CarCoordinate, defaultCarCoordinate } from '../models/CarCoordinate';

/** Key under which the saved coordinate is stored in AsyncStorage. */
const STORAGE_KEY = '@FindMyCar:coordinate';

/** Everything the context exposes to the screens that consume it. */
type LocationContextValue = {
  coordinate: CarCoordinate; // the currently saved car location
  loading: boolean; // true while the saved value is being read on launch
  saveCurrentLocation: () => Promise<CarCoordinate>;
  clearLocation: () => Promise<void>;
};

/** The context object itself; undefined until a Provider supplies a value. */
const LocationContext = createContext<LocationContextValue | undefined>(undefined);

/**
 * Provider component that owns the saved car coordinate and the functions
 * that change it. Wrap the app in this so every screen can call useLocation().
 * @param children - The component tree that should have access to the context.
 * @returns The children wrapped in a LocationContext.Provider.
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  // Current saved coordinate (starts as the (0, 0) placeholder)
  const [coordinate, setCoordinate] = useState<CarCoordinate>(defaultCarCoordinate);
  // Whether we are still loading the previously saved value from storage
  const [loading, setLoading] = useState(true);

  /**
   * Effect that runs once on mount: loads whatever coordinate was saved in a
   * previous session. RN equivalent of Swift's loadLocation() called from init().
   */
  useEffect(() => {
    /**
     * Async IIFE that reads the JSON string from AsyncStorage, parses it, and
     * updates state. Always turns `loading` off when finished, even on error.
     */
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json != null) setCoordinate(JSON.parse(json));
      } catch (error) {
        console.error('Error loading coordinate:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Gets the device's current GPS position, saves it to AsyncStorage, and
   * updates the shared coordinate state.
   * Steps: check location services → check/request permission → get a fix →
   * persist as JSON → update state.
   * @returns The newly saved coordinate.
   * @throws Error if location services are off or permission is denied.
   */
  async function saveCurrentLocation(): Promise<CarCoordinate> {
    // 1. Make sure location services are switched on for the device
    if (!(await Location.hasServicesEnabledAsync())) {
      throw new Error('Location services are disabled.');
    }

    // 2. Check current permission; only prompt the user if not yet granted
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      ({ status } = await Location.requestForegroundPermissionsAsync());
    }
    if (status !== 'granted') {
      throw new Error('Location access denied. Please enable in Settings.');
    }

    // 3. Ask for the most accurate position available
    const fix = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    // 4. Keep only the lat/lon we need
    const next: CarCoordinate = {
      latitude: fix.coords.latitude,
      longitude: fix.coords.longitude,
    };

    // 5. Persist to storage, then update state so all screens re-render
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCoordinate(next);
    return next;
  }

  /**
   * Resets the saved location back to the (0, 0) default, both in storage
   * and in state. Used by an optional "Clear Location" button.
   */
  async function clearLocation(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCarCoordinate));
    setCoordinate(defaultCarCoordinate);
  }

  return (
    <LocationContext.Provider value={{ coordinate, loading, saveCurrentLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Custom hook that gives a component access to the shared location state.
 * @returns The current LocationContext value.
 * @throws Error if called from a component that isn't inside a LocationProvider.
 */
export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside a LocationProvider');
  return ctx;
}
