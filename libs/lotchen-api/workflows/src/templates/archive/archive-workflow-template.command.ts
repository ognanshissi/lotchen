import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkflowsProvider } from '../../workflows.provider';
import { WorkflowVersionStatus } from '../../common/workflow.enums';

export class ArchiveWorkflowTemplateCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class ArchiveWorkflowTemplateCommandHandler
  implements CommandHandler<ArchiveWorkflowTemplateCommand, void>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(command: ArchiveWorkflowTemplateCommand): Promise<void> {
    const template = await this.workflowsProvider.WorkflowTemplateModel.findOne(
      { _id: command.id, deletedAt: null }
    ).lean();

    if (!template) {
      throw new NotFoundException('Workflow template not found');
    }

    await this.workflowsProvider.WorkflowTemplateModel.findByIdAndUpdate(
      command.id,
      {
        $set: {
          status: WorkflowVersionStatus.Archived,
          updatedBy: this.workflowsProvider.user().userId,
          updatedByInfo: this.workflowsProvider.user(),
        },
      }
    );
  }
}
