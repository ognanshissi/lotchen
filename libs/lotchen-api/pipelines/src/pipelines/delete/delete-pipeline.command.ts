import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PipelinesProvider } from '../../pipelines.provider';

export class DeletePipelineCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class DeletePipelineCommandHandler
  implements CommandHandler<DeletePipelineCommand, void>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(command: DeletePipelineCommand): Promise<void> {
    const pipeline = await this.pipelinesProvider.SalesPipelineModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    await this.pipelinesProvider.SalesPipelineModel.findByIdAndUpdate(
      command.id,
      {
        $set: {
          deletedAt: new Date(),
          updatedBy: this.pipelinesProvider.user().userId,
        },
      }
    );
  }
}
