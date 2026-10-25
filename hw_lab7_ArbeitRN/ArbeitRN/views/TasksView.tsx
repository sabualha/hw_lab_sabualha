import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTasks } from '../viewModels/TasksContext';
import TaskRowView from './TaskRowView';
import type { TasksStackParamList } from '../types';

// Navigation type so navigate('TaskDetails', ...) is type-checked
type NavProp = NativeStackNavigationProp<TasksStackParamList, 'TasksList'>;

// The main list screen. Shows a spinner while loading, a message when
// there are no tasks, and otherwise a scrollable list of tasks.
export default function TasksView() {
  // Pull the shared task data and the toggle function from context
  const { tasks, loading, toggleCompleted } = useTasks();
  const navigation = useNavigation<NavProp>();

  // Still waiting for Firestore's first response
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Loaded, but the collection is empty
  if (tasks.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No tasks yet</Text>
        <Text style={styles.emptySubtitle}>Head to the New Task tab to create one</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      // Each row needs a unique key; the Firestore id works
      keyExtractor={(item) => item.id!}
      // Draws one row per task
      renderItem={({ item }) => (
        <TaskRowView
          task={item}
          // Open the details screen, passing only the task's id
          onPress={() => navigation.navigate('TaskDetails', { taskId: item.id! })}
          // Flip completed in Firestore when the checkbox is tapped
          onToggleCompleted={() => toggleCompleted(item)}
        />
      )}
    />
  );
}

// Styles for the loading and empty states
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#666', marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#999', textAlign: 'center' },
});