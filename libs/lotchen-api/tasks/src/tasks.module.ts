import { Module } from '@nestjs/common';
import { TaskProvider, taskProviders } from './task.provider';
import { TasksController } from './tasks.controller';
import { CreateTaskCommandhandler } from './create/create-task.command';

@Module({
  controllers: [TasksController],
  providers: [...taskProviders, TaskProvider, CreateTaskCommandhandler],
  exports: [],
})
export class TasksModule {}
