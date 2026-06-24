import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DispatchingProvider } from '../../dispatching.provider';

export class DeleteDispatchRuleCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class DeleteDispatchRuleCommandHandler
  implements CommandHandler<DeleteDispatchRuleCommand, void>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(command: DeleteDispatchRuleCommand): Promise<void> {
    const rule = await this.dispatchingProvider.DispatchRuleModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!rule) {
      throw new NotFoundException('Dispatch rule not found');
    }

    await this.dispatchingProvider.DispatchRuleModel.findByIdAndUpdate(
      command.id,
      {
        $set: {
          deletedAt: new Date(),
          updatedBy: this.dispatchingProvider.user().userId,
        },
      }
    );
  }
}
