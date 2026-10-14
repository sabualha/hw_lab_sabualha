import React from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import { usePeople } from '../viewModels/PeopleContext';

type RouteProps = RouteProp<RootStackParamList, 'EditPerson'>;

// Spec: the edit screen for one contact. Looks up the person by the id passed
// in the route, shows a photo section plus name, email, and details fields,
// and writes every change straight to the context (which auto-saves).
export default function EditPersonView() {
  const route = useRoute<RouteProps>();
  const { personId } = route.params;
  const { getPerson, updatePerson } = usePeople();
  const person = getPerson(personId);

  if (!person) {
    return (
      <View style={styles.centered}>
        <Text>Contact not found.</Text>
      </View>
    );
  }

  // Spec: asks for photo library permission, opens the image picker, and if
  // the user chooses a photo, saves its uri on this person.
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      updatePerson(person.id, { photoUri: result.assets[0].uri });
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        {person.photoUri && (
          <Image source={{ uri: person.photoUri }} style={styles.photo} resizeMode="cover" />
        )}
        <Pressable style={styles.photoButton} onPress={pickImage}>
          <Ionicons name="person-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.photoButtonText}>Select a photo</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={person.name}
          onChangeText={(text) => updatePerson(person.id, { name: text })}
          textContentType="name"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={person.email}
          onChangeText={(text) => updatePerson(person.id, { email: text })}
          textContentType="emailAddress"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Details</Text>
        <TextInput
          style={[styles.input, styles.detailsInput]}
          placeholder="Details on this person"
          value={person.details}
          onChangeText={(text) => updatePerson(person.id, { details: text })}
          multiline
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { backgroundColor: '#fff', padding: 12, marginTop: 20 },
  sectionHeader: { fontSize: 13, color: '#666', textTransform: 'uppercase', marginBottom: 8 },
  input: {
    fontSize: 16, paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc',
  },
  detailsInput: { minHeight: 80, textAlignVertical: 'top', borderBottomWidth: 0 },
  photo: { width: '100%', height: 240, borderRadius: 8, marginBottom: 12 },
  photoButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  photoButtonText: { fontSize: 16, color: '#007AFF' },
});