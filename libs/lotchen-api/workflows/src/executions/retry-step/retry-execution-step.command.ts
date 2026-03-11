import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { WorkflowsProvider } from '../../workflows.provider';
import {
  ExecutionStatusEnum,
  StepStatusEnum,
} from '../../common/workflow.enums';

export class RetryExecutionStepCommandRequest {
  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  @IsString()
  nodeId!: string;
}

export class RetryExecutionStepCommand extends RetryExecutionStepCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class RetryExecutionStepCommandHandler
  implements CommandHandler<RetryExecutionStepCommand, void>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(command: RetryExecutionStepCommand): Promise<void> {
    const execution =
      await this.workflowsProvider.WorkflowExecutionModel.findById(
        command.id
      ).lean();

    if (!execution) {
      throw new NotFoundException('Workflow execution not found');
    }

    if (execution.status !== ExecutionStatusEnum.Failed) {
      throw new BadRequestException('Can only retry failed executions');
    }

    const stepLog = (execution.stepLogs || []).find(
      (s: any) => s.nodeId === command.nodeId
    );
    if (!stepLog) {
      throw new NotFoundException('Step not found in this execution');
    }

    await this.workflowsProvider.WorkflowExecutionModel.findOneAndUpdate(
      { _id: command.id, 'stepLogs.nodeId': command.nodeId },
      {
        $set: {
          status: ExecutionStatusEnum.Running,
          'stepLogs.$.status': StepStatusEnum.Running,
          'stepLogs.$.startedAt': new Date(),
          'stepLogs.$.errorMessage': null,
        },
        $inc: { 'stepLogs.$.retryCount': 1 },
      }
    );
  }
}
