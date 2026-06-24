import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { IsArray, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { DispatchingProvider } from '../../dispatching.provider';

export class RulePriorityItem {
  @ApiProperty({ type: String })
  @IsString()
  id!: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  priority!: number;
}

export class ReorderDispatchRulesCommand {
  @ApiProperty({ type: [RulePriorityItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RulePriorityItem)
  items!: RulePriorityItem[];
}

@Injectable()
export class ReorderDispatchRulesCommandHandler
  implements CommandHandler<ReorderDispatchRulesCommand, void>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(command: ReorderDispatchRulesCommand): Promise<void> {
    const user = this.dispatchingProvider.user();
    const bulkOps = command.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id, deletedAt: null },
        update: {
          $set: {
            priority: item.priority,
            updatedBy: user.userId,
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await this.dispatchingProvider.DispatchRuleModel.bulkWrite(bulkOps);
    }
  }
}
