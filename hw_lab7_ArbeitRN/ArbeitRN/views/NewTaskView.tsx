import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTasks } from '../viewModels/TasksContext';
import { formatDate, makeDateChangeHandler, saveWithValidation } from '../viewModels/taskFormHelpers';
import type { RootTabParamList } from '../types';

// Navigation type so navigate('Tasks') is type-checked
type NavProp = BottomTabNavigationProp<RootTabParamList, 'NewTask'>;

// Form screen for creating a new task
export default function NewTaskView() {
  const { addTask } = useTasks();
  const navigation = useNavigation<NavProp>();

  // Local state for each form field
  const [name, setName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Handler passed to the date picker; updates dueDate when a date is chosen
  const onDateChange = makeDateChangeHandler(setShowPicker, setDueDate);

  // Runs when Save is tapped: validate, write to Firestore, clear the form,
  // then switch to the Tasks tab
  const onSave = () =>
    saveWithValidation(
      name,
      assignedTo,
      // The save step: add the task, then reset the form for next time
      async () => {
        await addTask({ name, assignedTo, dueDate, dateAdded: new Date(), completed: false });
        setName('');
        setAssignedTo('');
        setDueDate(new Date());
      },
      // After a successful save, jump to the list
      () => navigation.navigate('Tasks'),
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Task Name</Text>
        <TextInput style={styles.input} placeholder="Enter task name" value={name} onChangeText={setName} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Assigned To</Text>
        <TextInput style={styles.input} placeholder="Enter assignee name" value={assignedTo} onChangeText={setAssignedTo} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Due Date</Text>
        {/* Tapping the date shows or hides the picker */}
        <Pressable style={styles.dateButton} onPress={() => setShowPicker((s) => !s)}>
          <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}
      </View>

      <Pressable style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save Task</Text>
      </Pressable>
    </ScrollView>
  );
}

// Styles for the form
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, marginTop: 20 },
  label: { fontSize: 13, color: '#666', textTransform: 'uppercase', marginBottom: 8 },
  input: { fontSize: 17, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' },
  dateButton: { paddingVertical: 12 },
  dateText: { fontSize: 17, color: '#007AFF' },
  saveButton: { margin: 16, backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});