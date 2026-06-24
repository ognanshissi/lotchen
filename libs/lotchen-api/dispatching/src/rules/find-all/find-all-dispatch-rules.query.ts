import { QueryHandler } from '@lotchen/api/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { DispatchingProvider } from '../../dispatching.provider';

export class FindAllDispatchRulesQuery {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  objectType?: string;
}

@Injectable()
export class FindAllDispatchRulesQueryHandler
  implements QueryHandler<FindAllDispatchRulesQuery, any[]>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(query: FindAllDispatchRulesQuery): Promise<any[]> {
    const filter: Record<string, any> = { deletedAt: null };

    if (query.status) filter['status'] = query.status;
    if (query.objectType) filter['objectType'] = query.objectType;

    return this.dispatchingProvider.DispatchRuleModel.find(filter)
      .sort({ priority: 1, updatedAt: -1 })
      .lean();
  }
}
