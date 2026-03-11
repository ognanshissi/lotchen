export interface ExecutionContext {
  tenantId: string;
  targetEntityId: string;
  targetEntityType: string;
  triggerPayload: Record<string, any>;
  triggeredByUserId?: string;
  testMode?: boolean;
}
