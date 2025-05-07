import { DeleteTaskCommandHandler } from './delete/delete-task.command';
import { FindAllTasksQueryHandler } from './find-all/find-all-tasks.query';
import { CreateTaskCommandHandler } from './create/create-task.command';
import { CompleteTaskCommandHandler } from './complete-task/complete-task.command';

export * from './tasks.controller';
export * from './create/create-task.command';
export * from './find-all/find-all-tasks.query';
export * from './complete-task/complete-task.command';
export * from './complete-task/complete-task.command';

export const tasksModuleHandlers = [
  CreateTaskCommandHandler,
  FindAllTasksQueryHandler,
  CompleteTaskCommandHandler,
  DeleteTaskCommandHandler,
];
