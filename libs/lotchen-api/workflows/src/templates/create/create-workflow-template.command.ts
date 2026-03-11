import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, BadRequestException } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowsProvider } from '../../workflows.provider';
import { TriggerTypeEnum } from '../../common/workflow.enums';

export class WorkflowTriggerDto {
  @ApiProperty({ enum: TriggerTypeEnum })
  @IsEnum(TriggerTypeEnum)
  type!: string;

  @ApiPropertyOptional()
  @IsOptional()
  config?: Record<string, any>;
}

export class WorkflowNodeDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  nodeId?: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  actionType?: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  label!: string;

  @ApiPropertyOptional()
  @IsOptional()
  config?: Record<string, any>;

  @ApiProperty({ type: Number })
  position!: number;
}

export class WorkflowEdgeDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  fromNodeId!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  toNodeId!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  conditionLabel?: string;
}

export class CreateWorkflowTemplateCommand {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name!: string;

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

@Injectable()
export class CreateWorkflowTemplateCommandHandler
  implements CommandHandler<CreateWorkflowTemplateCommand, any>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(command: CreateWorkflowTemplateCommand): Promise<any> {
    const user = this.workflowsProvider.user();
    const doc = new this.workflowsProvider.WorkflowTemplateModel({
      name: command.name,
      description: command.description || '',
      trigger: command.trigger || { type: TriggerTypeEnum.Manual, config: {} },
      nodes: command.nodes || [],
      edges: command.edges || [],
      assignedToEntityType: command.assignedToEntityType,
      assignedToEntityId: command.assignedToEntityId,
      createdBy: user.userId,
      createdByInfo: user,
    });

    const errors = doc.validateSync();
    if (errors) {
      throw new BadRequestException(errors.message);
    }

    const saved = await doc.save();
    return saved.toObject();
  }
}
