import { Inject, Injectable, Provider } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { Task, TaskDocument, TaskSchema } from './task.schema';
import { BaseSchemaProvider, RequestExtendedWithUser } from '@lotchen/api/core';
import { REQUEST } from '@nestjs/core';

export const TASK_MODEL = 'TASK_MODEL';

@Injectable()
export class TaskProvider extends BaseSchemaProvider {
  constructor(
    @Inject(TASK_MODEL)
    public readonly TaskModel: Model<TaskDocument>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}

export const taskProviders: Provider[] = [
  {
    provide: TASK_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Task.name, TaskSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
];
