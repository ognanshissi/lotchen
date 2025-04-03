import { Module } from '@nestjs/common';
import { activitiesProviders } from './activities.provider';
import { CreateTaskCommandhandler, FindAllTasksQueryHandler } from './tasks';
import { TasksController } from './tasks/tasks.controller';
import {
  CreateNoteCommandHandler,
  FindAllNotesQueryHandler,
  NotesController,
} from './notes';
import { CompleteTaskCommandhandler } from './tasks/complete-task/complete-task.command';

@Module({
  controllers: [TasksController, NotesController],
  providers: [
    ...activitiesProviders,
    CreateTaskCommandhandler,
    FindAllTasksQueryHandler,
    CreateNoteCommandHandler,
    FindAllNotesQueryHandler,
    CompleteTaskCommandhandler,
  ],
  exports: [],
})
export class ActivitiesModule {}
