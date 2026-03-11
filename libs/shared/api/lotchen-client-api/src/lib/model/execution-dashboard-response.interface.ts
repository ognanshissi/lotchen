export interface ExecutionDashboardResponse {
  activeInstances: number;
  completedLast30Days: number;
  failedLast30Days: number;
  completionRate: number;
  averageDurationMs: number;
}
