import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DispatchingProvider } from '../../dispatching.provider';

export class FindDispatchRuleByIdQuery {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

export class FindDispatchRuleByIdQueryResponse {}

@Injectable()
export class FindDispatchRuleByIdQueryHandler
  implements
    QueryHandler<FindDispatchRuleByIdQuery, FindDispatchRuleByIdQueryResponse>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(
    query: FindDispatchRuleByIdQuery
  ): Promise<FindDispatchRuleByIdQueryResponse> {
    const rule = await this.dispatchingProvider.DispatchRuleModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!rule) {
      throw new NotFoundException('Dispatch rule not found');
    }

    return rule;
  }
}
