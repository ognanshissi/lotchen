export * from './find-by-id/find-execution-by-id.query';
export * from './find-all/find-all-executions.query';
export * from './retry-step/retry-execution-step.command';
export * from './skip-step/skip-execution-step.command';
export * from './cancel/cancel-execution.command';
export * from './trigger-manual/trigger-manual-workflow.command';
export * from './dashboard/execution-dashboard.query';
export * from './test-run/test-run-workflow.command';
export * from './workflow-executions.controller';
export * from './workflow-execution.schema';

import { FindExecutionByIdQueryHandler } from './find-by-id/find-execution-by-id.query';
import { FindAllExecutionsQueryHandler } from './find-all/find-all-executions.query';
import { RetryExecutionStepCommandHandler } from './retry-step/retry-execution-step.command';
import { SkipExecutionStepCommandHandler } from './skip-step/skip-execution-step.command';
import { CancelExecutionCommandHandler } from './cancel/cancel-execution.command';
import { TriggerManualWorkflowCommandHandler } from './trigger-manual/trigger-manual-workflow.command';
import { ExecutionDashboardQueryHandler } from './dashboard/execution-dashboard.query';
import { TestRunWorkflowCommandHandler } from './test-run/test-run-workflow.command';

export const executionModuleHandlers = [
  FindExecutionByIdQueryHandler,
  FindAllExecutionsQueryHandler,
  RetryExecutionStepCommandHandler,
  SkipExecutionStepCommandHandler,
  CancelExecutionCommandHandler,
  TriggerManualWorkflowCommandHandler,
  ExecutionDashboardQueryHandler,
  TestRunWorkflowCommandHandler,
];
