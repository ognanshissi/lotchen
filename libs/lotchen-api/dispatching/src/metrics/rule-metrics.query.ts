import { QueryHandler } from '@lotchen/api/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { DispatchingProvider } from '../dispatching.provider';

export class RuleMetricsQuery {
  id!: string;

  @ApiPropertyOptional({ type: String, description: 'ISO date string' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ type: String, description: 'ISO date string' })
  @IsOptional()
  @IsString()
  to?: string;
}

export interface RuleMetricsResult {
  totalAssignments: number;
  assignmentsByDay: { date: string; count: number }[];
  assignmentsByTargetType: { type: string; count: number }[];
  escalationCount: number;
}

@Injectable()
export class RuleMetricsQueryHandler
  implements QueryHandler<RuleMetricsQuery, RuleMetricsResult>
{
  constructor(private readonly dispatchingProvider: DispatchingProvider) {}

  async handlerAsync(query: RuleMetricsQuery): Promise<RuleMetricsResult> {
    const rule = await this.dispatchingProvider.DispatchRuleModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!rule) {
      throw new NotFoundException('Dispatch rule not found');
    }

    const dateFilter: Record<string, any> = { ruleId: query.id };
    if (query.from || query.to) {
      dateFilter['createdAt'] = {};
      if (query.from) dateFilter['createdAt']['$gte'] = new Date(query.from);
      if (query.to) dateFilter['createdAt']['$lte'] = new Date(query.to);
    }

    const [totalAssignments, byDay, byTargetType, escalationCount] =
      await Promise.all([
        this.dispatchingProvider.DispatchAuditLogModel.countDocuments(
          dateFilter
        ),

        this.dispatchingProvider.DispatchAuditLogModel.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: '$_id', count: 1 } },
        ]),

        this.dispatchingProvider.DispatchAuditLogModel.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: '$assignedTarget.type',
              count: { $sum: 1 },
            },
          },
          { $project: { _id: 0, type: '$_id', count: 1 } },
        ]),

        this.dispatchingProvider.DispatchAuditLogModel.countDocuments({
          ...dateFilter,
          triggeredBy: 'escalation',
        }),
      ]);

    return {
      totalAssignments,
      assignmentsByDay: byDay as { date: string; count: number }[],
      assignmentsByTargetType: byTargetType as {
        type: string;
        count: number;
      }[],
      escalationCount,
    };
  }
}
