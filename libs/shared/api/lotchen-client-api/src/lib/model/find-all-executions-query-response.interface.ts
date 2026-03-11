export interface FindAllExecutionsQueryResponse {
  _id: string;
  workflowTemplateId: string;
  workflowName: string;
  workflowVersion: number;
  status: string;
  triggerType: string;
  targetEntityId: string;
  targetEntityType: string;
  currentNodeId?: string;
  completedAt?: string;
  testMode: boolean;
  createdAt: string;
  updatedAt: string;
}
