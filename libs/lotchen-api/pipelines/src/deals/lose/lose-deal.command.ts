import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PipelinesProvider } from '../../pipelines.provider';
import { DealOutcome } from '../../common/pipeline.enums';

export class LoseDealCommandRequest {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  lostReason?: string;
}

export class LoseDealCommand extends LoseDealCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class LoseDealCommandHandler
  implements CommandHandler<LoseDealCommand, any>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(command: LoseDealCommand): Promise<any> {
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

    const lostStage = pipeline.stages.find((s) => s.isLost);
    if (!lostStage) {
      throw new BadRequestException('Pipeline has no "lost" stage configured');
    }

    const now = new Date();
    const stageHistory = [...deal.stageHistory];
    const currentEntry = stageHistory.find(
      (h) => h.stageId === deal.stageId && !h.exitedAt
    );
    if (currentEntry) {
      currentEntry.exitedAt = now;
    }
    stageHistory.push({
      stageId: lostStage.stageId,
      stageName: lostStage.name,
      enteredAt: now,
      movedByUserId: user.userId,
    });

    deal.stageId = lostStage.stageId;
    deal.outcome = DealOutcome.Lost;
    deal.closedAt = now;
    deal.lostReason = command.lostReason || '';
    deal.stageHistory = stageHistory;
    deal.updatedBy = user.userId;
    await deal.save();

    return deal.toObject();
  }
}
