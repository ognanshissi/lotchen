import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowsProvider } from '../../workflows.provider';
import { WorkflowVersionStatus } from '../../common/workflow.enums';
import {
  WorkflowTriggerDto,
  WorkflowNodeDto,
  WorkflowEdgeDto,
} from '../create/create-workflow-template.command';

export class UpdateWorkflowTemplateCommandRequest {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: WorkflowTriggerDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowTriggerDto)
  trigger?: WorkflowTriggerDto;

  @ApiPropertyOptional({ type: [WorkflowNodeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowNodeDto)
  nodes?: WorkflowNodeDto[];

  @ApiPropertyOptional({ type: [WorkflowEdgeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowEdgeDto)
  edges?: WorkflowEdgeDto[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignedToEntityType?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignedToEntityId?: string;
}

export class UpdateWorkflowTemplateCommand extends UpdateWorkflowTemplateCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class UpdateWorkflowTemplateCommandHandler
  implements CommandHandler<UpdateWorkflowTemplateCommand, void>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(command: UpdateWorkflowTemplateCommand): Promise<void> {
    const template = await this.workflowsProvider.WorkflowTemplateModel.findOne(
      { _id: command.id, deletedAt: null }
    ).lean();

    if (!template) {
      throw new NotFoundException('Workflow template not found');
    }

    if (template.status === WorkflowVersionStatus.Active) {
      throw new BadRequestException(
        'Cannot edit an active workflow. Archive it first.'
      );
    }

    const $set: Record<string, any> = {
      updatedBy: this.workflowsProvider.user().userId,
      updatedByInfo: this.workflowsProvider.user(),
    };

    if (command.name !== undefined) $set['name'] = command.name;
    if (command.description !== undefined)
      $set['description'] = command.description;
    if (command.trigger !== undefined) $set['trigger'] = command.trigger;
    if (command.nodes !== undefined) $set['nodes'] = command.nodes;
    if (command.edges !== undefined) $set['edges'] = command.edges;
    if (command.assignedToEntityType !== undefined)
      $set['assignedToEntityType'] = command.assignedToEntityType;
    if (command.assignedToEntityId !== undefined)
      $set['assignedToEntityId'] = command.assignedToEntityId;

    await this.workflowsProvider.WorkflowTemplateModel.findByIdAndUpdate(
      command.id,
      { $set }
    );
  }
}
