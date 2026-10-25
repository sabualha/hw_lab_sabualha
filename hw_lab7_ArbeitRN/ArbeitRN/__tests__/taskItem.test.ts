import {
  isValidTask,
  compareTasksByName,
  compareTasksByDueDate,
  areTasksEqual,
  TaskItem,
} from '../models/TaskItem';

// One fixed date shared by all samples. new Date() would differ by
// milliseconds between calls and break the equality tests.
const fixedDate = new Date('2026-01-15T00:00:00Z');

// Builds a valid TaskItem; pass overrides to change specific fields
function sample(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    name: 'Write lab',
    assignedTo: 'Prof H',
    dueDate: fixedDate,
    dateAdded: fixedDate,
    completed: false,
    ...overrides,
  };
}

// Tests for the validation function
describe('isValidTask', () => {
  // An empty name should be rejected
  test('rejects an empty name', () => {
    expect(isValidTask('', 'someone')).toBe(false);
  });

  // An empty assignee should be rejected
  test('rejects an empty assignee', () => {
    expect(isValidTask('something', '')).toBe(false);
  });

  // Fields containing only spaces count as empty
  test('rejects whitespace-only fields', () => {
    expect(isValidTask('   ', 'someone')).toBe(false);
    expect(isValidTask('something', '   ')).toBe(false);
  });

  // Both fields filled in is valid
  test('accepts both fields present', () => {
    expect(isValidTask('something', 'someone')).toBe(true);
  });
});

// Tests for the two sort helpers
describe('comparators', () => {
  // Names should end up in alphabetical order
  test('compareTasksByName sorts alphabetically', () => {
    const list = [sample({ name: 'Cherry' }), sample({ name: 'Apple' }), sample({ name: 'Banana' })];
    list.sort(compareTasksByName);
    expect(list.map((t) => t.name)).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  // Earliest due date should come first
  test('compareTasksByDueDate sorts earliest-first', () => {
    const a = sample({ name: 'A', dueDate: new Date('2026-03-01') });
    const b = sample({ name: 'B', dueDate: new Date('2026-01-01') });
    const c = sample({ name: 'C', dueDate: new Date('2026-02-01') });
    const list = [a, b, c].sort(compareTasksByDueDate);
    expect(list.map((t) => t.name)).toEqual(['B', 'C', 'A']);
  });
});

// Tests for the equality helper
describe('areTasksEqual', () => {
  // Completion state is not part of equality
  test('ignores completion state and id', () => {
    const a = sample();
    const b = sample({ completed: true });
    expect(areTasksEqual(a, b)).toBe(true);
  });

  // A different name makes tasks unequal
  test('differs when the name differs', () => {
    expect(areTasksEqual(sample({ name: 'A' }), sample({ name: 'B' }))).toBe(false);
  });

  // A different due date makes tasks unequal
  test('differs when the due date differs', () => {
    expect(
      areTasksEqual(sample({ dueDate: new Date('2026-01-01') }), sample({ dueDate: new Date('2026-02-01') }))
    ).toBe(false);
  });
});