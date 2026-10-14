import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Person, createBlankPerson } from '../models/Person';

const STORAGE_KEY = '@SimpleContacts:people';

export type SortOrder = 'asc' | 'desc';

// Spec: pure helper. Returns a new array of the people whose names contain the
// search text (trimmed, case-insensitive), sorted by name A-Z ('asc') or Z-A
// ('desc'). An empty or whitespace-only search keeps everyone. Never mutates
// the input array.
export function filterAndSort(people: Person[], searchText: string, sortOrder: SortOrder): Person[] {
  const needle = searchText.trim().toLowerCase();
  const filtered = needle === ''
    ? people
    : people.filter((p) => p.name.toLowerCase().includes(needle));
  return [...filtered].sort((a, b) =>
    sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );
}

type PeopleContextValue = {
  people: Person[];
  loading: boolean;
  addPerson: () => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  getPerson: (id: string) => Person | undefined;
};

const PeopleContext = createContext<PeopleContextValue | undefined>(undefined);

// Spec: wraps the app and shares the list of people with every screen. Loads
// saved people from AsyncStorage when it first mounts, and saves the whole
// list back to AsyncStorage whenever it changes, so screens never save by hand.
export function PeopleProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  // Spec: runs once on mount; reads the saved JSON from storage (if any) into
  // state, then marks loading as finished so saving is allowed to start.
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json != null) setPeople(JSON.parse(json));
      } catch (error) {
        console.error('Error loading people:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Spec: runs whenever `people` changes; writes the array to AsyncStorage as
  // JSON. Skipped while loading so an empty list doesn't overwrite saved data.
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(people)).catch((error) =>
        console.error('Error saving people:', error)
      );
    }
  }, [people, loading]);

  // Spec: creates a blank person, appends it to the list, and returns it so
  // the caller can navigate straight to its edit screen.
  const addPerson = (): Person => {
    const person = createBlankPerson();
    setPeople((prev) => [...prev, person]);
    return person;
  };

  // Spec: merges the given fields into the person with the matching id and
  // leaves everyone else unchanged.
  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // Spec: removes the person with the matching id from the list.
  const deletePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  // Spec: returns the current person with the matching id, or undefined if
  // there is none.
  const getPerson = (id: string) => people.find((p) => p.id === id);

  return (
    <PeopleContext.Provider
      value={{ people, loading, addPerson, updatePerson, deletePerson, getPerson }}
    >
      {children}
    </PeopleContext.Provider>
  );
}

// Spec: hook that returns the people context. Throws a clear error if it is
// called outside a PeopleProvider.
export function usePeople(): PeopleContextValue {
  const ctx = useContext(PeopleContext);
  if (!ctx) throw new Error('usePeople must be used inside a PeopleProvider');
  return ctx;
}