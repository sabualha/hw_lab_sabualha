import { Alert, Platform } from 'react-native';
import { isValidTask } from '../models/TaskItem';

// Turns a Date into readable text, e.g. "October 27, 2026"
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Builds the function the date picker calls when the user picks a date.
// setShowPicker shows/hides the picker; onPick receives the chosen date.
export function makeDateChangeHandler(
  setShowPicker: (show: boolean) => void,
  onPick: (date: Date) => void,
) {
  // The handler returned to the picker's onChange prop
  return (_event: unknown, selected?: Date) => {
    // Android auto-dismisses; iOS stays open until we set it to false ourselves.
    setShowPicker(Platform.OS === 'ios');
    // If the user actually picked a date (didn't cancel), pass it along
    if (selected) onPick(selected);
  };
}

// Shared save flow for both form screens: validate -> save -> close.
// save does the actual write; onDone runs afterwards (e.g. navigate away).
export async function saveWithValidation(
  name: string,
  assignedTo: string,
  save: () => Promise<void>,
  onDone: () => void,
) {
  // Stop and warn the user if either field is empty
  if (!isValidTask(name, assignedTo)) {
    Alert.alert('Validation Error', 'Please fill in both name and assignee.');
    return;
  }
  try {
    await save();
    onDone();
  } catch (error) {
    // Log for debugging and tell the user the save failed
    console.error(error);
    Alert.alert('Error', 'Failed to save task.');
  }
}

// Asks "Are you sure?" before deleting. Only the Delete button runs
// performDelete; onDone runs after a successful delete (e.g. go back).
export function confirmDelete(
  performDelete: () => Promise<void>,
  onDone: () => void,
) {
  Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      // Runs when the user taps Delete in the alert
      onPress: async () => {
        try {
          await performDelete();
          onDone();
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'Failed to delete task.');
        }
      },
    },
  ]);
}