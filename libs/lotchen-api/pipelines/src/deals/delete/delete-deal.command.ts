import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PipelinesProvider } from '../../pipelines.provider';

export class DeleteDealCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class DeleteDealCommandHandler
  implements CommandHandler<DeleteDealCommand, void>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(command: DeleteDealCommand): Promise<void> {
    const deal = await this.pipelinesProvider.DealModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    await this.pipelinesProvider.DealModel.findByIdAndUpdate(command.id, {
      $set: {
        deletedAt: new Date(),
        updatedBy: this.pipelinesProvider.user().userId,
      },
    });
  }
}
