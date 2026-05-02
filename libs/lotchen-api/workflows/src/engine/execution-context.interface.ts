export interface ExecutionContext {
  targetEntityId: string;
  targetEntityType: string;
  triggerPayload: Record<string, any>;
  triggeredByUserId?: string;
  testMode?: boolean;
}
