import { Module } from '@nestjs/common';
import { activitiesProviders } from './activities.provider';
import { tasksModuleHandlers, TasksController } from './tasks';
import { NotesController, notesModuleHandlers } from './notes';
import { MeetingsController, meetingsModuleHandlers } from './meetings';

@Module({
  controllers: [TasksController, NotesController, MeetingsController],
  providers: [
    ...activitiesProviders,
    ...notesModuleHandlers,
    ...tasksModuleHandlers,
    ...meetingsModuleHandlers,
  ],
  exports: [],
})
export class ActivitiesModule {}
