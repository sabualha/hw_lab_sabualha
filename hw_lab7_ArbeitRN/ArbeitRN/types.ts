// Screens inside the Tasks tab's stack, and the params each one needs.
// TaskDetails only receives the task's id; the screen looks up the
// freshest copy of the task from context.
export type TasksStackParamList = {
  TasksList: undefined;
  TaskDetails: { taskId: string };
};

// The two bottom tabs. Neither needs params.
export type RootTabParamList = {
  Tasks: undefined;
  NewTask: undefined;
};