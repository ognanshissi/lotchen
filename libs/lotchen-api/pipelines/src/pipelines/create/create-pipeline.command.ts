import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PipelinesProvider } from '../../pipelines.provider';
import { randomUUID } from 'crypto';

export class PipelineStageDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  stageId?: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  order!: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  winProbability?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  requiredFields?: string[];

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isWon?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isLost?: boolean;
}

export class CreatePipelineCommand {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [PipelineStageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PipelineStageDto)
  stages?: PipelineStageDto[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  currency?: string;
}

const DEFAULT_STAGES: PipelineStageDto[] = [
  { name: 'Prospect', order: 0, color: '#6366f1', winProbability: 10 },
  { name: 'Qualification', order: 1, color: '#8b5cf6', winProbability: 25 },
  { name: 'Proposition', order: 2, color: '#a855f7', winProbability: 50 },
  { name: 'Négociation', order: 3, color: '#d946ef', winProbability: 75 },
  {
    name: 'Clôture',
    order: 4,
    color: '#22c55e',
    winProbability: 100,
    isWon: true,
  },
  {
    name: 'Perdu',
    order: 5,
    color: '#ef4444',
    winProbability: 0,
    isLost: true,
  },
];

@Injectable()
export class CreatePipelineCommandHandler
  implements CommandHandler<CreatePipelineCommand, any>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(command: CreatePipelineCommand): Promise<any> {
    const user = this.pipelinesProvider.user();

    const stages = (
      command.stages && command.stages.length > 0
        ? command.stages
        : DEFAULT_STAGES
    ).map((s) => ({
      stageId: s.stageId || randomUUID(),
      name: s.name,
      order: s.order,
      color: s.color || '#6366f1',
      winProbability: s.winProbability ?? 0,
      requiredFields: s.requiredFields || [],
      isWon: s.isWon || false,
      isLost: s.isLost || false,
    }));

    const doc = new this.pipelinesProvider.SalesPipelineModel({
      name: command.name,
      description: command.description || '',
      stages,
      currency: command.currency || 'XOF',
      createdBy: user.userId,
      createdByInfo: user,
    });

    const saved = await doc.save();
    return saved.toObject();
  }
}
