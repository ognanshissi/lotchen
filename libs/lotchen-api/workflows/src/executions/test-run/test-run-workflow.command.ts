import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WorkflowsProvider } from '../../workflows.provider';
import { WorkflowEngineService } from '../../engine/workflow-engine.service';
import { Model } from 'mongoose';
import { WorkflowExecution } from '../workflow-execution.schema';

export class TestRunWorkflowCommand {
  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  @IsString()
  workflowTemplateId!: string;

  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  @IsString()
  targetEntityId!: string;

  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  @IsString()
  targetEntityType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  triggerPayload?: Record<string, any>;
}

@Injectable()
export class TestRunWorkflowCommandHandler
  implements CommandHandler<TestRunWorkflowCommand, any>
{
  constructor(
    private readonly workflowsProvider: WorkflowsProvider,
    private readonly workflowEngine: WorkflowEngineService
  ) {}

  async handlerAsync(command: TestRunWorkflowCommand): Promise<any> {
    const template = await this.workflowsProvider.WorkflowTemplateModel.findOne(
      { _id: command.workflowTemplateId, deletedAt: null }
    ).lean();

    if (!template) {
      throw new NotFoundException('Workflow template not found');
    }

    return this.workflowEngine.startExecution(
      template,
      {
        targetEntityId: command.targetEntityId,
        targetEntityType: command.targetEntityType,
        triggerPayload: command.triggerPayload || {},
        triggeredByUserId: this.workflowsProvider.user().userId,
        testMode: true,
      },
      this.workflowsProvider
        .WorkflowExecutionModel as unknown as Model<WorkflowExecution>
    );
  }
}
