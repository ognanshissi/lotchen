import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IsOptional, IsDateString } from 'class-validator';
import { PipelinesProvider } from '../pipelines.provider';
import { DealOutcome } from '../common/pipeline.enums';

export class PipelineAnalyticsQuery {
  id!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

@Injectable()
export class PipelineAnalyticsQueryHandler
  implements QueryHandler<PipelineAnalyticsQuery, any>
{
  constructor(private readonly pipelinesProvider: PipelinesProvider) {}

  async handlerAsync(query: PipelineAnalyticsQuery): Promise<any> {
    const pipeline = await this.pipelinesProvider.SalesPipelineModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    const dateFilter: Record<string, any> = {};
    if (query.dateFrom) dateFilter['$gte'] = new Date(query.dateFrom);
    if (query.dateTo) dateFilter['$lte'] = new Date(query.dateTo);

    const matchFilter: Record<string, any> = {
      pipelineId: query.id,
      deletedAt: null,
    };
    if (Object.keys(dateFilter).length > 0) {
      matchFilter['createdAt'] = dateFilter;
    }

    const deals = await this.pipelinesProvider.DealModel.find(
      matchFilter
    ).lean();

    // Stage stats
    const stageMap = new Map(pipeline.stages.map((s) => [s.stageId, s]));

    const stageStats = pipeline.stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stageId === stage.stageId);
      const totalValue = stageDeals.reduce(
        (sum, d) => sum + (d.amount || 0),
        0
      );

      // Average days in stage from stageHistory
      const daysInStage: number[] = [];
      for (const deal of deals) {
        for (const entry of deal.stageHistory || []) {
          if (entry.stageId === stage.stageId && entry.exitedAt) {
            const ms =
              new Date(entry.exitedAt).getTime() -
              new Date(entry.enteredAt).getTime();
            daysInStage.push(ms / (1000 * 60 * 60 * 24));
          }
        }
      }

      return {
        stageId: stage.stageId,
        stageName: stage.name,
        color: stage.color,
        count: stageDeals.length,
        totalValue,
        avgDaysInStage:
          daysInStage.length > 0
            ? Math.round(
                (daysInStage.reduce((a, b) => a + b, 0) / daysInStage.length) *
                  10
              ) / 10
            : 0,
      };
    });

    // Conversion rates between consecutive stages
    const activeStages = pipeline.stages
      .filter((s) => !s.isWon && !s.isLost)
      .sort((a, b) => a.order - b.order);

    const conversionRates: any[] = [];
    for (let i = 0; i < activeStages.length - 1; i++) {
      const fromStage = activeStages[i];
      const toStage = activeStages[i + 1];

      // Count deals that ever entered each stage
      const enteredFrom = deals.filter((d) =>
        d.stageHistory?.some((h) => h.stageId === fromStage.stageId)
      ).length;
      const enteredTo = deals.filter((d) =>
        d.stageHistory?.some((h) => h.stageId === toStage.stageId)
      ).length;

      conversionRates.push({
        fromStage: fromStage.name,
        toStage: toStage.name,
        rate: enteredFrom > 0 ? Math.round((enteredTo / enteredFrom) * 100) : 0,
      });
    }

    // Win/Loss stats
    const wonDeals = deals.filter((d) => d.outcome === DealOutcome.Won);
    const lostDeals = deals.filter((d) => d.outcome === DealOutcome.Lost);
    const openDeals = deals.filter((d) => d.outcome === DealOutcome.Open);

    const winLossStats = {
      totalDeals: deals.length,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      openDeals: openDeals.length,
      winRate:
        wonDeals.length + lostDeals.length > 0
          ? Math.round(
              (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
            )
          : 0,
      totalWonValue: wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
      totalLostValue: lostDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
    };

    // By agent
    const agentMap = new Map<string, any>();
    for (const deal of deals) {
      if (!deal.assignedTo) continue;
      const key = deal.assignedTo;
      if (!agentMap.has(key)) {
        agentMap.set(key, {
          agentId: deal.assignedTo,
          agentName: deal.assignedToName || 'Non assigné',
          dealsCount: 0,
          wonCount: 0,
          totalValue: 0,
        });
      }
      const agent = agentMap.get(key)!;
      agent.dealsCount++;
      if (deal.outcome === DealOutcome.Won) agent.wonCount++;
      agent.totalValue += deal.amount || 0;
    }

    return {
      stageStats,
      conversionRates,
      winLossStats,
      byAgent: Array.from(agentMap.values()),
    };
  }
}
