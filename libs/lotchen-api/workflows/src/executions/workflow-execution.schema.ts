import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import { ExecutionStatusEnum, StepStatusEnum } from '../common/workflow.enums';

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class ExecutionStepLog extends AggregateRoot {
  @Prop({ required: true, type: 'UUID' })
  nodeId!: string;

  @Prop({ required: true, type: String })
  nodeLabel!: string;

  @Prop({ required: true, enum: StepStatusEnum, type: String })
  status!: string;

  @Prop({ required: true, type: Date })
  startedAt!: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  output?: Record<string, any>;

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Number, default: 0 })
  retryCount!: number;
}

export type WorkflowExecutionDocument = HydratedDocument<WorkflowExecution>;

@Schema({ collection: 'workflow_executions', timestamps: true })
export class WorkflowExecution extends AggregateRoot {
  @Prop({ required: true, type: 'UUID' })
  workflowTemplateId!: string;

  @Prop({ required: true, type: String })
  workflowName!: string;

  @Prop({ required: true, type: Number })
  workflowVersion!: number;

  @Prop({
    required: true,
    enum: ExecutionStatusEnum,
    default: ExecutionStatusEnum.Running,
    type: String,
  })
  status!: string;

  @Prop({ required: true, type: String })
  triggerType!: string;

  @Prop({ type: 'UUID' })
  triggeredByUserId?: string;

  @Prop({ required: true, type: 'UUID' })
  targetEntityId!: string;

  @Prop({ required: true, type: String })
  targetEntityType!: string;

  @Prop({ type: 'UUID' })
  currentNodeId?: string;

  @Prop({ type: [ExecutionStepLog], default: [] })
  stepLogs!: ExecutionStepLog[];

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  triggerPayload!: Record<string, any>;

  @Prop({ type: Boolean, default: false })
  testMode!: boolean;
}

export const WorkflowExecutionSchema =
  SchemaFactory.createForClass(WorkflowExecution);

WorkflowExecutionSchema.index({ workflowTemplateId: 1, status: 1 });
WorkflowExecutionSchema.index({ targetEntityId: 1 });
