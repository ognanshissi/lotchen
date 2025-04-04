import { Module } from '@nestjs/common';
import { activitiesProviders } from './activities.provider';
import {
  CreateTaskCommandhandler,
  CompleteTaskCommandhandler,
  FindAllTasksQueryHandler,
} from './tasks';
import { TasksController } from './tasks/tasks.controller';
import {
  CreateNoteCommandHandler,
  FindAllNotesQueryHandler,
  NotesController,
} from './notes';
import { CreateMeetingCommandHandler, MeetingsController } from './meetings';

@Module({
  controllers: [TasksController, NotesController, MeetingsController],
  providers: [
    ...activitiesProviders,
    CreateTaskCommandhandler,
    FindAllTasksQueryHandler,
    CreateNoteCommandHandler,
    FindAllNotesQueryHandler,
    CompleteTaskCommandhandler,
    CreateMeetingCommandHandler,
  ],
  exports: [],
})
export class ActivitiesModule {}
