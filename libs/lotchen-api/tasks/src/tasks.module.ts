import { Module } from '@nestjs/common';
import { TaskProvider, taskProviders } from './task.provider';
import { TasksController } from './tasks.controller';
import { CreateTaskCommandhandler } from './create/create-task.command';
import { FindAllTasksQueryHandler } from './find-all/find-all-tasks.query';

@Module({
  controllers: [TasksController],
  providers: [
    ...taskProviders,
    TaskProvider,
    CreateTaskCommandhandler,
    FindAllTasksQueryHandler,
  ],
  exports: [],
})
export class TasksModule {}
