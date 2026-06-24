import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DispatchingProvider } from '../../dispatching.provider';
import { DispatchRuleStatus } from '../../common/dispatch-rule.enums';

export class DeactivateDispatchRuleCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class DeactivateDispatchRuleCommandHandler
  implements CommandHandler<DeactivateDispatchRuleCommand, void>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(command: DeactivateDispatchRuleCommand): Promise<void> {
    const rule = await this.dispatchingProvider.DispatchRuleModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!rule) {
      throw new NotFoundException('Dispatch rule not found');
    }

    if (rule.status === DispatchRuleStatus.Inactive) {
      return;
    }

    await this.dispatchingProvider.DispatchRuleModel.findByIdAndUpdate(
      command.id,
      {
        $set: {
          status: DispatchRuleStatus.Inactive,
          updatedBy: this.dispatchingProvider.user().userId,
          updatedByInfo: this.dispatchingProvider.user(),
        },
      }
    );
  }
}
