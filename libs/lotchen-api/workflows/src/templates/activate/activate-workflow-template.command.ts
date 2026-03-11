import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WorkflowsProvider } from '../../workflows.provider';
import {
  WorkflowVersionStatus,
  WorkflowNodeTypeEnum,
} from '../../common/workflow.enums';

export class ActivateWorkflowTemplateCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class ActivateWorkflowTemplateCommandHandler
  implements CommandHandler<ActivateWorkflowTemplateCommand, void>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(command: ActivateWorkflowTemplateCommand): Promise<void> {
    const template = await this.workflowsProvider.WorkflowTemplateModel.findOne(
      { _id: command.id, deletedAt: null }
    ).lean();

    if (!template) {
      throw new NotFoundException('Workflow template not found');
    }

    if (template.status === WorkflowVersionStatus.Active) {
      return;
    }

    if (!template.trigger || !template.trigger.type) {
      throw new BadRequestException('Workflow must have a trigger configured');
    }

    const actionNodes = (template.nodes || []).filter(
      (n) =>
        n.type === WorkflowNodeTypeEnum.Action ||
        n.type === WorkflowNodeTypeEnum.Condition
    );
    if (actionNodes.length === 0) {
      throw new BadRequestException(
        'Workflow must have at least one action or condition node'
      );
    }

    if (template.assignedToEntityType && template.assignedToEntityId) {
      await this.workflowsProvider.WorkflowTemplateModel.updateMany(
        {
          _id: { $ne: command.id },
          assignedToEntityType: template.assignedToEntityType,
          assignedToEntityId: template.assignedToEntityId,
          status: WorkflowVersionStatus.Active,
          deletedAt: null,
        },
        { $set: { status: WorkflowVersionStatus.Archived } }
      );
    }

    await this.workflowsProvider.WorkflowTemplateModel.findByIdAndUpdate(
      command.id,
      {
        $set: {
          status: WorkflowVersionStatus.Active,
          updatedBy: this.workflowsProvider.user().userId,
          updatedByInfo: this.workflowsProvider.user(),
        },
      }
    );
  }
}
