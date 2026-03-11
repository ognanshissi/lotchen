import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { WorkflowsProvider } from '../../workflows.provider';
import { StepStatusEnum } from '../../common/workflow.enums';

export class SkipExecutionStepCommandRequest {
  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  @IsString()
  nodeId!: string;
}

export class SkipExecutionStepCommand extends SkipExecutionStepCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class SkipExecutionStepCommandHandler
  implements CommandHandler<SkipExecutionStepCommand, void>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(command: SkipExecutionStepCommand): Promise<void> {
    const execution =
      await this.workflowsProvider.WorkflowExecutionModel.findById(
        command.id
      ).lean();

    if (!execution) {
      throw new NotFoundException('Workflow execution not found');
    }

    await this.workflowsProvider.WorkflowExecutionModel.findOneAndUpdate(
      { _id: command.id, 'stepLogs.nodeId': command.nodeId },
      {
        $set: {
          'stepLogs.$.status': StepStatusEnum.Skipped,
          'stepLogs.$.completedAt': new Date(),
        },
      }
    );
  }
}
