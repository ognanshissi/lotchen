import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { PipelinesProvider } from '../../pipelines.provider';

export class MoveDealStageCommandRequest {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  targetStageId!: string;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class MoveDealStageCommand extends MoveDealStageCommandRequest {
  id!: string;
}

@Injectable()
export class MoveDealStageCommandHandler
  implements CommandHandler<MoveDealStageCommand, any>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(command: MoveDealStageCommand): Promise<any> {
    const user = this.pipelinesProvider.user();

    const deal = await this.pipelinesProvider.DealModel.findOne({
      _id: command.id,
      deletedAt: null,
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    const pipeline = await this.pipelinesProvider.SalesPipelineModel.findOne({
      _id: deal.pipelineId,
      deletedAt: null,
    }).lean();

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    const targetStage = pipeline.stages.find(
      (s) => s.stageId === command.targetStageId
    );
    if (!targetStage) {
      throw new BadRequestException('Target stage not found in pipeline');
    }

    // Check required fields for target stage
    if (targetStage.requiredFields && targetStage.requiredFields.length > 0) {
      const dealObj = deal.toObject();
      const missingFields = targetStage.requiredFields.filter(
        (field) => !(dealObj as any)[field]
      );
      if (missingFields.length > 0) {
        throw new BadRequestException(
          `Missing required fields for stage "${
            targetStage.name
          }": ${missingFields.join(', ')}`
        );
      }
    }

    // Update stage history
    const now = new Date();
    const stageHistory = [...deal.stageHistory];

    // Close the current stage entry
    const currentEntry = stageHistory.find(
      (h) => h.stageId === deal.stageId && !h.exitedAt
    );
    if (currentEntry) {
      currentEntry.exitedAt = now;
    }

    // Add new stage entry
    stageHistory.push({
      stageId: command.targetStageId,
      stageName: targetStage.name,
      enteredAt: now,
      movedByUserId: user.userId,
    });

    const newOrder =
      command.order ??
      ((
        await this.pipelinesProvider.DealModel.findOne({
          pipelineId: deal.pipelineId,
          stageId: command.targetStageId,
          deletedAt: null,
        })
          .sort({ order: -1 })
          .select('order')
          .lean()
      )?.order ?? -1) + 1;

    deal.stageId = command.targetStageId;
    deal.stageHistory = stageHistory;
    deal.order = newOrder;
    deal.updatedBy = user.userId;
    await deal.save();

    return deal.toObject();
  }
}
