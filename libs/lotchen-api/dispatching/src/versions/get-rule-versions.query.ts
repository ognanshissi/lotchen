import { QueryHandler } from '@lotchen/api/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DispatchingProvider } from '../dispatching.provider';

export class GetRuleVersionsQuery {
  id!: string;
}

export interface RuleVersionSummary {
  version: number;
  name: string;
  status: string;
  objectType: string;
  snapshotAt: string;
}

@Injectable()
export class GetRuleVersionsQueryHandler
  implements QueryHandler<GetRuleVersionsQuery, RuleVersionSummary[]>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(
    query: GetRuleVersionsQuery
  ): Promise<RuleVersionSummary[]> {
    const rule = await this.dispatchingProvider.DispatchRuleModel.findOne(
      { _id: query.id, deletedAt: null },
      { versionHistory: 1, version: 1 }
    ).lean();

    if (!rule) {
      throw new NotFoundException('Dispatch rule not found');
    }

    const history: RuleVersionSummary[] = (rule.versionHistory ?? [])
      .slice()
      .reverse()
      .map((snap: any) => ({
        version: snap.version,
        name: snap.name,
        status: snap.status,
        objectType: snap.objectType,
        snapshotAt: snap.snapshotAt,
      }));

    return history;
  }
}
