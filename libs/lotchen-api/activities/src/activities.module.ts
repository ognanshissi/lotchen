import { Module } from '@nestjs/common';
import { activitiesProviders } from './activities.provider';
import { CreateTaskCommandhandler, FindAllTasksQueryHandler } from './tasks';
import { TasksController } from './tasks/tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [
    ...activitiesProviders,
    CreateTaskCommandhandler,
    FindAllTasksQueryHandler,
  ],
  exports: [],
})
export class ActivitiesModule {}
