import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TenantDatabaseService } from '@lotchen/api/core';
import { WorkflowEngineService } from './workflow-engine.service';
import { TriggerTypeEnum } from '../common/workflow.enums';
import {
  WorkflowTemplate,
  WorkflowTemplateSchema,
} from '../templates/workflow-template.schema';
import {
  WorkflowExecution,
  WorkflowExecutionSchema,
} from '../executions/workflow-execution.schema';

const CONTACT_CREATED = 'contact.created';
const LEAD_STATUS_CHANGED = 'lead.status_changed';

@Injectable()
export class WorkflowTriggerListener {
  private readonly logger = new Logger(WorkflowTriggerListener.name);

  constructor(
    private readonly workflowEngine: WorkflowEngineService,
    private readonly tenantDatabaseService: TenantDatabaseService
  ) {}

  private async getModels(tenantId: string) {
    const connection = await this.tenantDatabaseService.getTenantDatabase(
      tenantId
    );
    const WorkflowTemplateModel =
      connection.models[WorkflowTemplate.name] ||
      connection.model(WorkflowTemplate.name, WorkflowTemplateSchema);
    const WorkflowExecutionModel =
      connection.models[WorkflowExecution.name] ||
      connection.model(WorkflowExecution.name, WorkflowExecutionSchema);
    return { WorkflowTemplateModel, WorkflowExecutionModel };
  }

  @OnEvent(CONTACT_CREATED, { async: true })
  async handleContactCreated(payload: {
    tenantId: string;
    contactId: string;
    contactType?: string;
  }): Promise<void> {
    this.logger.debug(
      `Evaluating new_lead workflows for contact ${payload.contactId}`
    );
    try {
      const { WorkflowTemplateModel, WorkflowExecutionModel } =
        await this.getModels(payload.tenantId);
      await this.workflowEngine.evaluateAndExecute(
        TriggerTypeEnum.NewLead,
        {
          tenantId: payload.tenantId,
          targetEntityId: payload.contactId,
          targetEntityType: 'contact',
          triggerPayload: payload,
        },
        WorkflowTemplateModel,
        WorkflowExecutionModel
      );
    } catch (error) {
      this.logger.error('Error evaluating new_lead workflows', error);
    }
  }

  @OnEvent(LEAD_STATUS_CHANGED, { async: true })
  async handleLeadStatusChanged(payload: {
    tenantId: string;
    contactId: string;
    previousStatus: string;
    newStatus: string;
    changedByUserId: string;
  }): Promise<void> {
    this.logger.debug(
      `Evaluating status_change workflows for lead ${payload.contactId}`
    );
    try {
      const { WorkflowTemplateModel, WorkflowExecutionModel } =
        await this.getModels(payload.tenantId);
      await this.workflowEngine.evaluateAndExecute(
        TriggerTypeEnum.StatusChange,
        {
          tenantId: payload.tenantId,
          targetEntityId: payload.contactId,
          targetEntityType: 'contact',
          triggerPayload: {
            previousStatus: payload.previousStatus,
            newStatus: payload.newStatus,
            changedByUserId: payload.changedByUserId,
          },
          triggeredByUserId: payload.changedByUserId,
        },
        WorkflowTemplateModel,
        WorkflowExecutionModel
      );
    } catch (error) {
      this.logger.error('Error evaluating status_change workflows', error);
    }
  }
}
