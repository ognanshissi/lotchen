import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PipelinesProvider } from '../../pipelines.provider';
import { DealOutcome } from '../../common/pipeline.enums';

export class WinDealCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class WinDealCommandHandler
  implements CommandHandler<WinDealCommand, any>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(command: WinDealCommand): Promise<any> {
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

    const wonStage = pipeline.stages.find((s) => s.isWon);
    if (!wonStage) {
      throw new BadRequestException('Pipeline has no "won" stage configured');
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
      stageId: wonStage.stageId,
      stageName: wonStage.name,
      enteredAt: now,
      movedByUserId: user.userId,
    });

    deal.stageId = wonStage.stageId;
    deal.outcome = DealOutcome.Won;
    deal.closedAt = now;
    deal.stageHistory = stageHistory;
    deal.updatedBy = user.userId;
    await deal.save();

    return deal.toObject();
  }
}
