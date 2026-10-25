// Shape of one task, matching the fields stored in Firestore
export interface TaskItem {
  id?: string;          // Firestore document ID; absent until the task is saved
  name: string;         // Task title
  assignedTo: string;   // Person responsible
  dueDate: Date;        // When the task is due
  dateAdded: Date;      // When the task was created
  completed: boolean;   // Whether the task is done
}

// Returns true only if both name and assignee contain non-whitespace text
export function isValidTask(name: string, assignedTo: string): boolean {
  return name.trim().length > 0 && assignedTo.trim().length > 0;
}

// Sort helper: orders two tasks alphabetically by name
export function compareTasksByName(a: TaskItem, b: TaskItem): number {
  return a.name.localeCompare(b.name);
}

// Sort helper: orders two tasks by due date, earliest first
export function compareTasksByDueDate(a: TaskItem, b: TaskItem): number {
  return a.dueDate.getTime() - b.dueDate.getTime();
}

// Returns true if two tasks have the same name, assignee, and due date
// (ignores id and completed status)
export function areTasksEqual(a: TaskItem, b: TaskItem): boolean {
  return (
    a.name === b.name &&
    a.assignedTo === b.assignedTo &&
    a.dueDate.getTime() === b.dueDate.getTime()
  );
}