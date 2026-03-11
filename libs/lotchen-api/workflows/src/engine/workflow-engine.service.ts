import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import {
  ExecutionStatusEnum,
  StepStatusEnum,
  WorkflowActionTypeEnum,
  WorkflowVersionStatus,
  TriggerTypeEnum,
} from '../common/workflow.enums';
import { ExecutionContext } from './execution-context.interface';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  async evaluateAndExecute(
    triggerType: TriggerTypeEnum,
    payload: ExecutionContext,
    WorkflowTemplateModel: Model<any>,
    WorkflowExecutionModel: Model<any>
  ): Promise<void> {
    const templates = await WorkflowTemplateModel.find({
      status: WorkflowVersionStatus.Active,
      'trigger.type': triggerType,
      deletedAt: null,
    }).lean();

    for (const template of templates) {
      try {
        await this.startExecution(template, payload, WorkflowExecutionModel);
      } catch (error) {
        this.logger.error(
          `Failed to start execution for workflow ${template._id}`,
          error
        );
      }
    }
  }

  async startExecution(
    template: any,
    context: ExecutionContext,
    WorkflowExecutionModel: Model<any>
  ): Promise<any> {
    const execution = new WorkflowExecutionModel({
      workflowTemplateId: template._id,
      workflowName: template.name,
      workflowVersion: template.version || 1,
      status: ExecutionStatusEnum.Running,
      triggerType: template.trigger?.type || 'manual',
      triggeredByUserId: context.triggeredByUserId,
      targetEntityId: context.targetEntityId,
      targetEntityType: context.targetEntityType,
      triggerPayload: context.triggerPayload,
      testMode: context.testMode || false,
      stepLogs: [],
    });

    await execution.save();

    // Execute asynchronously — don't block the trigger
    this.executeWorkflow(
      execution,
      template,
      context,
      WorkflowExecutionModel
    ).catch((error) => {
      this.logger.error(`Workflow execution ${execution._id} failed`, error);
    });

    return execution.toObject();
  }

  async executeWorkflow(
    execution: any,
    template: any,
    context: ExecutionContext,
    WorkflowExecutionModel: Model<any>
  ): Promise<void> {
    const nodes: any[] = [...(template.nodes || [])].sort(
      (a: any, b: any) => a.position - b.position
    );

    let executionStatus = ExecutionStatusEnum.Completed;

    for (const node of nodes) {
      const stepLogNodeId = node.nodeId || randomUUID();
      const stepLog = {
        nodeId: stepLogNodeId,
        nodeLabel: node.label,
        status: StepStatusEnum.Running,
        startedAt: new Date(),
        retryCount: 0,
      };

      await WorkflowExecutionModel.findByIdAndUpdate(execution._id, {
        $set: { currentNodeId: stepLogNodeId },
        $push: { stepLogs: stepLog },
      });

      try {
        const output = await this.executeNode(node, context);

        await WorkflowExecutionModel.findOneAndUpdate(
          { _id: execution._id, 'stepLogs.nodeId': stepLogNodeId },
          {
            $set: {
              'stepLogs.$.status': StepStatusEnum.Completed,
              'stepLogs.$.completedAt': new Date(),
              'stepLogs.$.output': output || {},
            },
          }
        );
      } catch (error: any) {
        executionStatus = ExecutionStatusEnum.Failed;
        await WorkflowExecutionModel.findOneAndUpdate(
          { _id: execution._id, 'stepLogs.nodeId': stepLogNodeId },
          {
            $set: {
              'stepLogs.$.status': StepStatusEnum.Failed,
              'stepLogs.$.completedAt': new Date(),
              'stepLogs.$.errorMessage': error?.message || 'Unknown error',
            },
          }
        );
        break;
      }
    }

    await WorkflowExecutionModel.findByIdAndUpdate(execution._id, {
      $set: {
        status: executionStatus,
        completedAt: new Date(),
        currentNodeId: null,
      },
    });
  }

  private async executeNode(
    node: any,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    this.logger.debug(`Executing node ${node.label} (${node.actionType})`);

    switch (node.actionType as WorkflowActionTypeEnum) {
      case WorkflowActionTypeEnum.AssignUser:
        return this.executeAssignUser(node, context);
      case WorkflowActionTypeEnum.AssignTeam:
        return this.executeAssignTeam(node, context);
      case WorkflowActionTypeEnum.SendEmail:
        return this.executeSendEmail(node, context);
      case WorkflowActionTypeEnum.SendSms:
        return this.executeSendSms(node, context);
      case WorkflowActionTypeEnum.CreateTask:
        return this.executeCreateTask(node, context);
      case WorkflowActionTypeEnum.UpdateField:
        return this.executeUpdateField(node, context);
      case WorkflowActionTypeEnum.WaitDuration:
        return this.executeWaitDuration(node, context);
      case WorkflowActionTypeEnum.ConditionalBranch:
        return this.executeConditionalBranch(node, context);
      default:
        this.logger.warn(`Unknown action type: ${node.actionType}`);
        return {
          skipped: true,
          reason: `Unknown action type: ${node.actionType}`,
        };
    }
  }

  private async executeAssignUser(
    node: any,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { userId } = node.config || {};
    if (!userId) return { skipped: true, reason: 'No userId configured' };
    this.logger.log(
      `assign_user: set assignedToUserId=${userId} on ${context.targetEntityType}:${context.targetEntityId}`
    );
    return { assignedUserId: userId };
  }

  private async executeAssignTeam(
    node: any,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { teamId } = node.config || {};
    if (!teamId) return { skipped: true, reason: 'No teamId configured' };
    this.logger.log(
      `assign_team: set assignedToTeamId=${teamId} on ${context.targetEntityType}:${context.targetEntityId}`
    );
    return { assignedTeamId: teamId };
  }

  private async executeSendEmail(
    node: any,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { subject } = node.config || {};
    this.logger.log(
      `send_email: [PLACEHOLDER] subject="${subject}" to entity ${context.targetEntityId}`
    );
    return { emailQueued: true, subject };
  }

  private async executeSendSms(
    node: any,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { message } = node.config || {};
    this.logger.log(
      `send_sms: [PLACEHOLDER] message to entity ${context.targetEntityId}`
    );
    return { smsQueued: true, message };
  }

  private async executeCreateTask(
    node: any,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { title, dueDateOffsetDays } = node.config || {};
    const dueDate = dueDateOffsetDays
      ? new Date(Date.now() + dueDateOffsetDays * 24 * 60 * 60 * 1000)
      : null;
    this.logger.log(
      `create_task: [PLACEHOLDER] title="${title}" for ${context.targetEntityId}`
    );
    return { taskCreated: true, title, dueDate };
  }

  private async executeUpdateField(
    node: any,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { fieldName, value } = node.config || {};
    this.logger.log(
      `update_field: set ${fieldName}=${value} on ${context.targetEntityType}:${context.targetEntityId}`
    );
    return { fieldUpdated: fieldName, value };
  }

  private async executeWaitDuration(
    node: any,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { duration, unit } = node.config || {};
    const multiplier = unit === 'days' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    const resumeAt = new Date(Date.now() + (duration || 1) * multiplier);
    this.logger.log(`wait_duration: pause until ${resumeAt.toISOString()}`);
    return { paused: true, resumeAt };
  }

  private async executeConditionalBranch(
    node: any,
    context: ExecutionContext
  ): Promise<Record<string, any>> {
    const { fieldName, operator, value } = node.config || {};
    const entityValue = (context.triggerPayload as any)?.[fieldName];
    let conditionMet = false;
    switch (operator) {
      case 'equals':
        conditionMet = entityValue === value;
        break;
      case 'not_equals':
        conditionMet = entityValue !== value;
        break;
      case 'contains':
        conditionMet = String(entityValue || '').includes(String(value));
        break;
      case 'greater_than':
        conditionMet = Number(entityValue) > Number(value);
        break;
    }
    return { conditionMet, fieldName, operator, value, entityValue };
  }
}
