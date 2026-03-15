import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PipelinesProvider } from '../../pipelines.provider';

export class SetDefaultPipelineCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class SetDefaultPipelineCommandHandler
  implements CommandHandler<SetDefaultPipelineCommand, void>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(command: SetDefaultPipelineCommand): Promise<void> {
    const pipeline = await this.pipelinesProvider.SalesPipelineModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    await this.pipelinesProvider.SalesPipelineModel.updateMany(
      { deletedAt: null },
      { $set: { isDefault: false } }
    );

    await this.pipelinesProvider.SalesPipelineModel.findByIdAndUpdate(
      command.id,
      {
        $set: {
          isDefault: true,
          updatedBy: this.pipelinesProvider.user().userId,
        },
      }
    );
  }
}
