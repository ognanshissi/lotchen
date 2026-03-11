import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { WorkflowsProvider } from '../../workflows.provider';
import { ExecutionStatusEnum } from '../../common/workflow.enums';

export class ExecutionDashboardQuery {}

export interface ExecutionDashboardResponse {
  activeInstances: number;
  completedLast30Days: number;
  failedLast30Days: number;
  completionRate: number;
  averageDurationMs: number;
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
    };
  }
}
