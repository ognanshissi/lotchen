import { Module } from '@nestjs/common';
import { activitiesProviders } from './activities.provider';
import { CreateTaskCommandhandler, FindAllTasksQueryHandler } from './tasks';
import { TasksController } from './tasks/tasks.controller';
import {
  CreateNoteCommandHandler,
  FindAllNotesQueryHandler,
  NotesController,
} from './notes';

@Module({
  controllers: [TasksController, NotesController],
  providers: [
    ...activitiesProviders,
    CreateTaskCommandhandler,
    FindAllTasksQueryHandler,
    CreateNoteCommandHandler,
    FindAllNotesQueryHandler,
  ],
  exports: [],
})
export class ActivitiesModule {}
