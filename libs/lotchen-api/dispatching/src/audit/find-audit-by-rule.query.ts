import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DispatchingProvider } from '../dispatching.provider';

export class FindAuditByRuleQuery {
  id!: string;

  @ApiPropertyOptional({ type: Number, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ type: Number, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

export class FindAuditByRuleResponse {
  @ApiProperty({ type: Number }) total!: number;
  @ApiProperty({ type: Number }) page!: number;
  @ApiProperty({ type: Number }) limit!: number;
  @ApiProperty({ type: [Object] }) data!: any[];
}

@Injectable()
export class FindAuditByRuleQueryHandler
  implements QueryHandler<FindAuditByRuleQuery, FindAuditByRuleResponse>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(
    query: FindAuditByRuleQuery
  ): Promise<FindAuditByRuleResponse> {
    const rule = await this.dispatchingProvider.DispatchRuleModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!rule) {
      throw new NotFoundException('Dispatch rule not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.dispatchingProvider.DispatchAuditLogModel.countDocuments({
        ruleId: query.id,
      }),
      this.dispatchingProvider.DispatchAuditLogModel.find({ ruleId: query.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return { total, page, limit, data };
  }
}
