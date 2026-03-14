import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { WorkflowsProvider } from '../../workflows.provider';
import { ExecutionStatusEnum } from '../../common/workflow.enums';
import { ApiProperty } from '@nestjs/swagger';

export class ExecutionDashboardQuery {}

export class ExecutionDashboardResponse {
  @ApiProperty({ description: 'Execution activeInstances' })
  activeInstances!: number;
  @ApiProperty({ description: 'Execution completedLast30Days' })
  completedLast30Days!: number;
  @ApiProperty({ description: 'Execution failed last 30 days' })
  failedLast30Days!: number;
  @ApiProperty({ description: 'Execution completed last30Days' })
  completionRate!: number;
  @ApiProperty({ description: 'Execution average duration in milliseconds' })
  averageDurationMs!: number;
}

@Injectable()
export class ExecutionDashboardQueryHandler
  implements QueryHandler<ExecutionDashboardQuery, ExecutionDashboardResponse>
{
  constructor(private readonly workflowsProvider: WorkflowsProvider) {}

  async handlerAsync(
    _query: ExecutionDashboardQuery
  ): Promise<ExecutionDashboardResponse> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      activeInstances,
      completedLast30Days,
      failedLast30Days,
      durationAgg,
    ] = await Promise.all([
      this.workflowsProvider.WorkflowExecutionModel.countDocuments({
        status: ExecutionStatusEnum.Running,
      }),
      this.workflowsProvider.WorkflowExecutionModel.countDocuments({
        status: ExecutionStatusEnum.Completed,
        createdAt: { $gte: thirtyDaysAgo },
      }),
      this.workflowsProvider.WorkflowExecutionModel.countDocuments({
        status: ExecutionStatusEnum.Failed,
        createdAt: { $gte: thirtyDaysAgo },
      }),
      this.workflowsProvider.WorkflowExecutionModel.aggregate([
        {
          $match: {
            status: ExecutionStatusEnum.Completed,
            completedAt: { $ne: null },
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $project: {
            durationMs: { $subtract: ['$completedAt', '$createdAt'] },
          },
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$durationMs' },
          },
        },
      ]),
    ]);

    const totalLast30Days = completedLast30Days + failedLast30Days;
    const completionRate =
      totalLast30Days > 0
        ? Math.round((completedLast30Days / totalLast30Days) * 100)
        : 0;

    const averageDurationMs =
      durationAgg.length > 0 ? Math.round(durationAgg[0].avgDuration) : 0;

    return {
      activeInstances,
      completedLast30Days,
      failedLast30Days,
      completionRate,
      averageDurationMs,
    } as ExecutionDashboardResponse;
  }
}
