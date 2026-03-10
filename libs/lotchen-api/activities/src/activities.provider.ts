import { Inject, Injectable, Provider } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { Task, TaskDocument, TaskSchema } from './tasks/task.schema';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { REQUEST } from '@nestjs/core';
import { Note, NoteDocument, NoteSchema } from './notes/note.schema';
import {
  Meeting,
  MeetingDocument,
  MeetingSchema,
} from './meetings/meeting.schema';
import {
  EventType,
  EventTypeDocument,
  EventTypeSchema,
} from './event-types/event-type.schema';

// Model constants
export const TASK_MODEL = 'TASK_MODEL';
export const MEETING_MODEL = 'MEETING_MODEL';
export const NOTE_MODEL = 'NOTE_MODEL';
export const EVENT_TYPE_MODEL = 'EVENT_TYPE_MODEL';

// Provider
@Injectable()
export class ActivitiesProvider extends CurrentUserProvider {
  constructor(
    @Inject(TASK_MODEL)
    public readonly TaskModel: Model<TaskDocument>,
    @Inject(NOTE_MODEL) public readonly NoteModel: Model<NoteDocument>,
    @Inject(MEETING_MODEL) public readonly MeetingModel: Model<MeetingDocument>,
    @Inject(EVENT_TYPE_MODEL)
    public readonly EventTypeModel: Model<EventTypeDocument>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}

export const activitiesProviders: Provider[] = [
  {
    provide: TASK_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Task.name, TaskSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: NOTE_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Note.name, NoteSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: MEETING_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Meeting.name, MeetingSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: EVENT_TYPE_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(EventType.name, EventTypeSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  ActivitiesProvider,
];
