import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PipelinesProvider } from '../../pipelines.provider';
import { PipelineStageDto } from '../create/create-pipeline.command';

export class UpdatePipelineCommandRequest {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  name?: string;

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

export class UpdatePipelineCommand extends UpdatePipelineCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class UpdatePipelineCommandHandler
  implements CommandHandler<UpdatePipelineCommand, void>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(command: UpdatePipelineCommand): Promise<void> {
    const pipeline = await this.pipelinesProvider.SalesPipelineModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    const $set: Record<string, any> = {
      updatedBy: this.pipelinesProvider.user().userId,
      updatedByInfo: this.pipelinesProvider.user(),
    };

    if (command.name !== undefined) $set['name'] = command.name;
    if (command.description !== undefined)
      $set['description'] = command.description;
    if (command.stages !== undefined) $set['stages'] = command.stages;
    if (command.currency !== undefined) $set['currency'] = command.currency;

    await this.pipelinesProvider.SalesPipelineModel.findByIdAndUpdate(
      command.id,
      { $set }
    );
  }
}
