import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DispatchingProvider } from '../../dispatching.provider';
import { DispatchRuleStatus } from '../../common/dispatch-rule.enums';

export class ActivateDispatchRuleCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class ActivateDispatchRuleCommandHandler
  implements CommandHandler<ActivateDispatchRuleCommand, void>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(command: ActivateDispatchRuleCommand): Promise<void> {
    const rule = await this.dispatchingProvider.DispatchRuleModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!rule) {
      throw new NotFoundException('Dispatch rule not found');
    }

    if (rule.status === DispatchRuleStatus.Active) {
      return;
    }

    if (!rule.objectType) {
      throw new BadRequestException(
        'Dispatch rule must have an object type configured before activation'
      );
    }

    await this.dispatchingProvider.DispatchRuleModel.findByIdAndUpdate(
      command.id,
      {
        $set: {
          status: DispatchRuleStatus.Active,
          updatedBy: this.dispatchingProvider.user().userId,
          updatedByInfo: this.dispatchingProvider.user(),
        },
      }
    );
  }
}
