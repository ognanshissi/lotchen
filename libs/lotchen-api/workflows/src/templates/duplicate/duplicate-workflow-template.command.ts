import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkflowsProvider } from '../../workflows.provider';
import { WorkflowVersionStatus } from '../../common/workflow.enums';

export class DuplicateWorkflowTemplateCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class DuplicateWorkflowTemplateCommandHandler
  implements CommandHandler<DuplicateWorkflowTemplateCommand, any>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(command: DuplicateWorkflowTemplateCommand): Promise<any> {
    const template = await this.workflowsProvider.WorkflowTemplateModel.findOne(
      { _id: command.id, deletedAt: null }
    ).lean();

    if (!template) {
      throw new NotFoundException('Workflow template not found');
    }

    const user = this.workflowsProvider.user();
    const doc = new this.workflowsProvider.WorkflowTemplateModel({
      name: `${template.name} (copie)`,
      description: template.description,
      status: WorkflowVersionStatus.Draft,
      version: 1,
      trigger: template.trigger,
      nodes: template.nodes,
      edges: template.edges,
      assignedToEntityType: template.assignedToEntityType,
      assignedToEntityId: template.assignedToEntityId,
      createdBy: user.userId,
      createdByInfo: user,
    });

    const saved = await doc.save();
    return saved.toObject();
  }
}
