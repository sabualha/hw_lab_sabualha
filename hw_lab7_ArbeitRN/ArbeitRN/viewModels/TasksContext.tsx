import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { TaskItem } from '../models/TaskItem';

// Name of the Firestore collection that stores all tasks
const COLLECTION = 'tasks';

// Describes everything the context shares with the rest of the app:
// the task list, a loading flag, and the four functions that change tasks
type TasksContextValue = {
  tasks: TaskItem[];
  loading: boolean;
  addTask: (task: Omit<TaskItem, 'id'>) => Promise<void>;
  updateTask: (task: TaskItem) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleCompleted: (task: TaskItem) => Promise<void>;
};

// The shared "box" that screens read from. It starts as undefined until
// TasksProvider fills it, so useTasks() can detect a missing provider.
const TasksContext = createContext<TasksContextValue | undefined>(undefined);

// Wraps the app, keeps the task list in sync with Firestore in real time,
// and shares the list plus the add/update/delete/toggle functions with all screens
export function TasksProvider({ children }: { children: ReactNode }) {
  // The current list of tasks (starts empty until Firestore replies)
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  // True until the first response (or error) from Firestore arrives
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates from Firestore. The unsubscribe returned
  // by onSnapshot is what we call on unmount to tear the listener down.
  // The empty [] means this runs once, when the provider first mounts.
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION),
      // Success callback: runs once with the current data, then again
      // every time any document in the collection changes
      (snapshot) => {
        // Convert each Firestore document into a TaskItem the app can use
        const next: TaskItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id, // the document ID is stored outside the data, so add it here
            name: data.name,
            assignedTo: data.assignedTo,
            // Firestore Timestamps become plain Dates; fall back to now if missing
            dueDate: data.dueDate?.toDate() ?? new Date(),
            dateAdded: data.dateAdded?.toDate() ?? new Date(),
            // Treat a missing completed field as not completed
            completed: data.completed ?? false,
          };
        });

        // Sort: incomplete tasks first, then by due date ascending.
        // Comparator: returns positive/negative to decide the order of two tasks.
        next.sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        });

        // Save the sorted list to state and hide the loading spinner
        setTasks(next);
        setLoading(false);
      },
      // Error callback: runs if the listener fails (e.g. expired security rules)
      (error) => {
        console.error('Firestore listener error:', error);
        setLoading(false);
      }
    );

    // Cleanup function: React calls this on unmount to stop listening
    return unsubscribe;
  }, []);

  // Creates a new task document in Firestore. Firestore generates the ID.
  // Dates are converted from Date to Timestamp before saving.
  const addTask = async (task: Omit<TaskItem, 'id'>) => {
    await addDoc(collection(db, COLLECTION), {
      ...task,
      dueDate: Timestamp.fromDate(task.dueDate),
      dateAdded: Timestamp.fromDate(task.dateAdded),
    });
  };

  // Saves edits to an existing task. Throws if the task has no ID.
  // dateAdded is left out because it never changes after creation.
  const updateTask = async (task: TaskItem) => {
    if (!task.id) throw new Error('Cannot update a task without an id');
    await updateDoc(doc(db, COLLECTION, task.id), {
      name: task.name,
      assignedTo: task.assignedTo,
      dueDate: Timestamp.fromDate(task.dueDate),
      completed: task.completed,
    });
  };

  // Permanently deletes the task document with the given ID
  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  };

  // Flips a task between completed and not completed.
  // Only the completed field is written, nothing else changes.
  const toggleCompleted = async (task: TaskItem) => {
    if (!task.id) throw new Error('Cannot toggle a task without an id');
    await updateDoc(doc(db, COLLECTION, task.id), { completed: !task.completed });
  };

  // Make the list and functions available to every component inside the provider
  return (
    <TasksContext.Provider value={{ tasks, loading, addTask, updateTask, deleteTask, toggleCompleted }}>
      {children}
    </TasksContext.Provider>
  );
}

// Custom hook screens call to access the tasks and functions.
// Throws a clear error if used outside a TasksProvider.
export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used inside a TasksProvider');
  return ctx;
}