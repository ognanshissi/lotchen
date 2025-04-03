import { Inject, Injectable, Provider } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { Task, TaskDocument, TaskSchema } from './tasks/task.schema';
import { BaseSchemaProvider, RequestExtendedWithUser } from '@lotchen/api/core';
import { REQUEST } from '@nestjs/core';
import { Note, NoteSchema, NoteDocument } from './notes/note.schema';

// Model constants
export const TASK_MODEL = 'TASK_MODEL';
export const MEETING_MODEL = 'MEETING_MODEL';
export const NOTE_MODEL = 'NOTE_MODEL';

// Provider
@Injectable()
export class ActivitiesProvider extends BaseSchemaProvider {
  constructor(
    @Inject(TASK_MODEL)
    public readonly TaskModel: Model<TaskDocument>,
    @Inject(NOTE_MODEL) public readonly NoteModel: Model<NoteDocument>,
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
  ActivitiesProvider,
];
