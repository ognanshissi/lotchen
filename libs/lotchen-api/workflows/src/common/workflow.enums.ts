export enum TriggerTypeEnum {
  StatusChange = 'status_change',
  NewLead = 'new_lead',
  FormSubmission = 'form_submission',
  DateBased = 'date_based',
  Manual = 'manual',
}

export enum WorkflowNodeTypeEnum {
  Trigger = 'trigger',
  Action = 'action',
  Condition = 'condition',
  Wait = 'wait',
}

export enum WorkflowActionTypeEnum {
  AssignUser = 'assign_user',
  AssignTeam = 'assign_team',
  SendEmail = 'send_email',
  SendSms = 'send_sms',
  CreateTask = 'create_task',
  UpdateField = 'update_field',
  WaitDuration = 'wait_duration',
  ConditionalBranch = 'conditional_branch',
}

export enum WorkflowVersionStatus {
  Draft = 'draft',
  Active = 'active',
  Archived = 'archived',
}

export enum ExecutionStatusEnum {
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Paused = 'paused',
}

export enum StepStatusEnum {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Skipped = 'skipped',
}
