import { Inject, Injectable, Provider } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { REQUEST } from '@nestjs/core';
import {
  WorkflowTemplate,
  WorkflowTemplateDocument,
  WorkflowTemplateSchema,
} from './templates/workflow-template.schema';
import {
  WorkflowExecution,
  WorkflowExecutionDocument,
  WorkflowExecutionSchema,
} from './executions/workflow-execution.schema';

export const WORKFLOW_TEMPLATE_MODEL = 'WORKFLOW_TEMPLATE_MODEL';
export const WORKFLOW_EXECUTION_MODEL = 'WORKFLOW_EXECUTION_MODEL';

@Injectable()
export class WorkflowsProvider extends CurrentUserProvider {
  constructor(
    @Inject(WORKFLOW_TEMPLATE_MODEL)
    public readonly WorkflowTemplateModel: Model<WorkflowTemplateDocument>,
    @Inject(WORKFLOW_EXECUTION_MODEL)
    public readonly WorkflowExecutionModel: Model<WorkflowExecutionDocument>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}

export const workflowsProviders: Provider[] = [
  {
    provide: WORKFLOW_TEMPLATE_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(
        WorkflowTemplate.name,
        WorkflowTemplateSchema
      );
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: WORKFLOW_EXECUTION_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(
        WorkflowExecution.name,
        WorkflowExecutionSchema
      );
    },
    inject: ['TENANT_CONNECTION'],
  },
  WorkflowsProvider,
];
