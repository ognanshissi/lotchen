import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkflowsProvider } from '../../workflows.provider';
import { ExecutionStatusEnum } from '../../common/workflow.enums';

export class CancelExecutionCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class CancelExecutionCommandHandler
  implements CommandHandler<CancelExecutionCommand, void>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(command: CancelExecutionCommand): Promise<void> {
    const execution =
      await this.workflowsProvider.WorkflowExecutionModel.findById(
        command.id
      ).lean();

    if (!execution) {
      throw new NotFoundException('Workflow execution not found');
    }

    await this.workflowsProvider.WorkflowExecutionModel.findByIdAndUpdate(
      command.id,
      {
        $set: {
          status: ExecutionStatusEnum.Cancelled,
          completedAt: new Date(),
        },
      }
    );
  }
}
