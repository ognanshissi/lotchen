import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkflowsProvider } from '../../workflows.provider';

export class DeleteWorkflowTemplateCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class DeleteWorkflowTemplateCommandHandler
  implements CommandHandler<DeleteWorkflowTemplateCommand, void>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(command: DeleteWorkflowTemplateCommand): Promise<void> {
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
          deletedAt: new Date(),
          updatedBy: this.workflowsProvider.user().userId,
        },
      }
    );
  }
}
