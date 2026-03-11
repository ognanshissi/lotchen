export interface ExecutionStepLogDto {
  nodeId: string;
  nodeLabel: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  output?: Record<string, any>;
  errorMessage?: string;
  retryCount: number;
}

export interface FindExecutionByIdQueryResponse {
  _id: string;
  workflowTemplateId: string;
  workflowName: string;
  workflowVersion: number;
  status: string;
  triggerType: string;
  triggeredByUserId?: string;
  targetEntityId: string;
  targetEntityType: string;
  currentNodeId?: string;
  stepLogs: ExecutionStepLogDto[];
  completedAt?: string;
  triggerPayload: Record<string, any>;
  testMode: boolean;
  createdAt: string;
  updatedAt: string;
}
