import React, { useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, FlatList } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { usePeople, filterAndSort, SortOrder } from '../viewModels/PeopleContext';
import type { RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'People'>;

// Spec: the contacts list screen. Shows all people filtered by the header
// search bar and sorted by name, lets you tap a row to edit, swipe to delete,
// and use the header buttons to sort or add a contact.
export default function PeopleView() {
  const navigation = useNavigation<NavProp>();
  const { people, addPerson, deletePerson } = usePeople();
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Spec: creates a blank person and immediately opens its edit screen.
  const handleAdd = () => {
    const person = addPerson();
    navigation.navigate('EditPerson', { personId: person.id });
  };

  // Spec: shows a menu (an alert with buttons) to choose A-Z or Z-A sorting.
  const handleSort = () => {
    Alert.alert('Sort', undefined, [
      { text: 'Name (A-Z)', onPress: () => setSortOrder('asc') },
      { text: 'Name (Z-A)', onPress: () => setSortOrder('desc') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Spec: configures the navigation header once: a native search bar that
  // updates searchText, plus sort and add buttons on the right.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: 'Search',
        onChangeText: (event: any) => setSearchText(event.nativeEvent.text),
      },
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={handleSort}>
            <Ionicons name="swap-vertical" size={22} color="#007AFF" />
          </Pressable>
          <Pressable onPress={handleAdd}>
            <Ionicons name="add" size={26} color="#007AFF" />
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  // Spec: recomputes the filtered and sorted list only when the people, the
  // search text, or the sort order changes.
  const displayedPeople = useMemo(
    () => filterAndSort(people, searchText, sortOrder),
    [people, searchText, sortOrder]
  );

  return (
    <FlatList
      data={displayedPeople}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Swipeable
          renderRightActions={() => (
            <Pressable style={styles.deleteAction} onPress={() => deletePerson(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
        >
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('EditPerson', { personId: item.id })}
          >
            <Text style={styles.name}>{item.name || 'New Contact'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </Pressable>
        </Swipeable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  name: { fontSize: 17 },
  deleteAction: { backgroundColor: 'red', justifyContent: 'center', paddingHorizontal: 20 },
  deleteText: { color: 'white', fontWeight: 'bold' },
});