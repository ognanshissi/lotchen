import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { PipelinesProvider } from '../../pipelines.provider';

export class ReorderDealsCommand {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsNotEmpty()
  dealIds!: string[];

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  stageId!: string;
}

@Injectable()
export class ReorderDealsCommandHandler
  implements CommandHandler<ReorderDealsCommand, void>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(command: ReorderDealsCommand): Promise<void> {
    const bulkOps = command.dealIds.map((dealId, index) => ({
      updateOne: {
        filter: { _id: dealId },
        update: { $set: { order: index, stageId: command.stageId } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.pipelinesProvider.DealModel.bulkWrite(bulkOps);
    }
  }
}
