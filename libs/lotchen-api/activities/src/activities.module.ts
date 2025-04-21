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
  DeleteNoteCommandHandler,
  FindAllNotesQueryHandler,
  NotesController,
} from './notes';
import { CreateMeetingCommandHandler, MeetingsController } from './meetings';
import { DeleteTaskCommandHandler } from './tasks/delete/delete-task.command';

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
    DeleteTaskCommandHandler,
    DeleteNoteCommandHandler,
  ],
  exports: [],
})
export class ActivitiesModule {}
