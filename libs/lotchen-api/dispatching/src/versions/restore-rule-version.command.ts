import { CommandHandler } from '@lotchen/api/core';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DispatchingProvider } from '../dispatching.provider';
import { DispatchRuleStatus } from '../common/dispatch-rule.enums';

export class RestoreRuleVersionCommand {
  id!: string;
  version!: number;
}

@Injectable()
export class RestoreRuleVersionCommandHandler
  implements CommandHandler<RestoreRuleVersionCommand, void>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(command: RestoreRuleVersionCommand): Promise<void> {
    const rule = await this.dispatchingProvider.DispatchRuleModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!rule) {
      throw new NotFoundException('Dispatch rule not found');
    }

    const snapshot = (rule.versionHistory ?? []).find(
      (v: any) => v.version === command.version
    );

    if (!snapshot) {
      throw new BadRequestException(
        `Version ${command.version} not found for this rule`
      );
    }

    // Snapshot the current state before restoring
    const currentSnapshot = {
      version: rule.version,
      name: rule.name,
      description: rule.description,
      status: rule.status,
      objectType: rule.objectType,
      priority: rule.priority,
      conditions: rule.conditions,
      targets: rule.targets,
      routingStrategy: rule.routingStrategy,
      capacityRules: rule.capacityRules,
      availabilityConfig: rule.availabilityConfig,
      escalationRules: rule.escalationRules,
      snapshotAt: new Date().toISOString(),
    };

    const user = this.dispatchingProvider.user();
    await this.dispatchingProvider.DispatchRuleModel.findByIdAndUpdate(
      command.id,
      {
        $set: {
          name: snapshot.name,
          description: snapshot.description,
          objectType: snapshot.objectType,
          priority: snapshot.priority,
          conditions: snapshot.conditions,
          targets: snapshot.targets,
          routingStrategy: snapshot.routingStrategy,
          capacityRules: snapshot.capacityRules,
          availabilityConfig: snapshot.availabilityConfig,
          escalationRules: snapshot.escalationRules,
          status: DispatchRuleStatus.Draft, // reset to draft after restore
          version: rule.version + 1,
          updatedBy: user.userId,
          updatedByInfo: user,
        },
        $push: { versionHistory: currentSnapshot },
      }
    );
  }
}
