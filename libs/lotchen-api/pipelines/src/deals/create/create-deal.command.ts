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
  IsNumber,
  IsArray,
  IsDateString,
} from 'class-validator';
import { PipelinesProvider } from '../../pipelines.provider';

export class CreateDealCommand {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  pipelineId!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  stageId?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  assignedToName?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

@Injectable()
export class CreateDealCommandHandler
  implements CommandHandler<CreateDealCommand, any>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(command: CreateDealCommand): Promise<any> {
    const user = this.pipelinesProvider.user();

    const pipeline = await this.pipelinesProvider.SalesPipelineModel.findOne({
      _id: command.pipelineId,
      deletedAt: null,
    }).lean();

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    let stageId = command.stageId;
    if (!stageId) {
      const firstStage = pipeline.stages
        .filter((s) => !s.isWon && !s.isLost)
        .sort((a, b) => a.order - b.order)[0];
      if (!firstStage) {
        throw new BadRequestException('Pipeline has no active stages');
      }
      stageId = firstStage.stageId;
    }

    const stage = pipeline.stages.find((s) => s.stageId === stageId);
    if (!stage) {
      throw new BadRequestException('Stage not found in pipeline');
    }

    const maxOrder = await this.pipelinesProvider.DealModel.findOne({
      pipelineId: command.pipelineId,
      stageId,
      deletedAt: null,
    })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const doc = new this.pipelinesProvider.DealModel({
      title: command.title,
      pipelineId: command.pipelineId,
      stageId,
      amount: command.amount || 0,
      currency: pipeline.currency,
      contactId: command.contactId,
      contactName: command.contactName,
      leadId: command.leadId,
      assignedTo: command.assignedTo,
      assignedToName: command.assignedToName,
      expectedCloseDate: command.expectedCloseDate
        ? new Date(command.expectedCloseDate)
        : undefined,
      notes: command.notes,
      tags: command.tags || [],
      order: (maxOrder?.order ?? -1) + 1,
      stageHistory: [
        {
          stageId,
          stageName: stage.name,
          enteredAt: new Date(),
          movedByUserId: user.userId,
        },
      ],
      createdBy: user.userId,
      createdByInfo: user,
    });

    const saved = await doc.save();
    return saved.toObject();
  }
}
