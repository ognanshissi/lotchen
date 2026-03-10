import { Module } from '@nestjs/common';
import { activitiesProviders } from './activities.provider';
import { tasksModuleHandlers, TasksController } from './tasks';
import { NotesController, notesModuleHandlers } from './notes';
import { MeetingsController, meetingsModuleHandlers } from './meetings';
import { EventTypesController, eventTypesModuleHandlers } from './event-types';

@Module({
  controllers: [
    TasksController,
    NotesController,
    MeetingsController,
    EventTypesController,
  ],
  providers: [
    ...activitiesProviders,
    ...notesModuleHandlers,
    ...tasksModuleHandlers,
    ...meetingsModuleHandlers,
    ...eventTypesModuleHandlers,
  ],
  exports: [],
})
export class ActivitiesModule {}
