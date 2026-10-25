import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useTasks } from '../viewModels/TasksContext';
import type { TasksStackParamList } from '../types';
import {
  formatDate, makeDateChangeHandler, saveWithValidation, confirmDelete,
} from '../viewModels/taskFormHelpers';
import { Ionicons } from '@expo/vector-icons';

// Route type so route.params.taskId is type-checked
type RouteProps = RouteProp<TasksStackParamList, 'TaskDetails'>;

// Edit screen for one existing task: change fields, save, or delete
export default function TaskDetailsView() {
  const { tasks, updateTask, deleteTask } = useTasks();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();

  // Look up the freshest copy of the task using the id passed in navigation
  const task = tasks.find((t) => t.id === route.params.taskId);

  // Local form state, seeded from the task. Edits stay local until Save is tapped.
  // (All hooks must run before any early return, so they come first.)
  const [name, setName] = useState(task?.name ?? '');
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo ?? '');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? new Date());
  const [completed, setCompleted] = useState(task?.completed ?? false);
  const [showPicker, setShowPicker] = useState(false);

  // The task may have been deleted (e.g. from the Firebase console)
  if (!task) {
    return (
      <View style={styles.centered}>
        <Text>Task not found.</Text>
      </View>
    );
  }

  // Handler passed to the date picker; updates dueDate when a date is chosen
  const onDateChange = makeDateChangeHandler(setShowPicker, setDueDate);

  // Runs when Save Changes is tapped: validate, update Firestore, go back
  const onSave = () =>
    saveWithValidation(
      name, assignedTo,
      // Write the edited values over the original task
      () => updateTask({ ...task, name, assignedTo, dueDate, completed }),
      // After saving, return to the list
      () => navigation.goBack(),
    );

  // Runs when Delete Task is tapped: confirm, delete, go back
  const onDelete = () =>
    confirmDelete(() => deleteTask(task.id!), () => navigation.goBack());

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Task Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Assigned To</Text>
        <TextInput style={styles.input} value={assignedTo} onChangeText={setAssignedTo} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Due Date</Text>
        {/* Tapping the date shows or hides the picker */}
        <Pressable onPress={() => setShowPicker((s) => !s)}>
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

      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        {/* Tapping the row flips the local completed value */}
        <Pressable style={styles.statusRow} onPress={() => setCompleted((c) => !c)}>
          <Ionicons
            name={completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={26}
            color={completed ? '#34C759' : '#007AFF'}
          />
          <Text style={styles.statusText}>{completed ? 'Completed' : 'Not Completed'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>Delete Task</Text>
      </Pressable>
    </ScrollView>
  );
}

// Styles for the details form
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, marginTop: 20 },
  label: { fontSize: 13, color: '#666', textTransform: 'uppercase', marginBottom: 8 },
  input: { fontSize: 17, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' },
  dateText: { fontSize: 17, color: '#007AFF', paddingVertical: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  statusText: { fontSize: 17 },
  saveButton: { margin: 16, backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  deleteButton: { marginHorizontal: 16, marginBottom: 32, backgroundColor: '#FF3B30', padding: 16, borderRadius: 8, alignItems: 'center' },
  deleteButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});