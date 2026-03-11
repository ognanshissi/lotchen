import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import { randomUUID } from 'crypto';
import {
  TriggerTypeEnum,
  WorkflowNodeTypeEnum,
  WorkflowActionTypeEnum,
  WorkflowVersionStatus,
} from '../common/workflow.enums';

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class WorkflowTrigger {
  @Prop({ required: true, enum: TriggerTypeEnum, type: String })
  type!: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  config!: Record<string, any>;
}

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class WorkflowNode {
  @Prop({ type: 'UUID', default: () => randomUUID(), required: true })
  nodeId!: string;

  @Prop({ required: true, enum: WorkflowNodeTypeEnum, type: String })
  type!: string;

  @Prop({ enum: WorkflowActionTypeEnum, type: String })
  actionType?: string;

  @Prop({ required: true, type: String })
  label!: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  config!: Record<string, any>;

  @Prop({ required: true, type: Number })
  position!: number;
}

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class WorkflowEdge {
  @Prop({ required: true, type: 'UUID' })
  fromNodeId!: string;

  @Prop({ required: true, type: 'UUID' })
  toNodeId!: string;

  @Prop({ type: String })
  conditionLabel?: string;
}

export type WorkflowTemplateDocument = HydratedDocument<WorkflowTemplate>;

@Schema({ collection: 'workflow_templates', timestamps: true })
export class WorkflowTemplate extends AggregateRoot {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ type: String, default: '' })
  description!: string;

  @Prop({
    required: true,
    enum: WorkflowVersionStatus,
    default: WorkflowVersionStatus.Draft,
    type: String,
  })
  status!: string;

  @Prop({ required: true, type: Number, default: 1 })
  version!: number;

  @Prop({ type: WorkflowTrigger })
  trigger!: WorkflowTrigger;

  @Prop({ type: [WorkflowNode], default: [] })
  nodes!: WorkflowNode[];

  @Prop({ type: [WorkflowEdge], default: [] })
  edges!: WorkflowEdge[];

  @Prop({ type: String })
  assignedToEntityType?: string;

  @Prop({ type: 'UUID' })
  assignedToEntityId?: string;
}

export const WorkflowTemplateSchema =
  SchemaFactory.createForClass(WorkflowTemplate);

WorkflowTemplateSchema.index({ status: 1 });
WorkflowTemplateSchema.index({
  assignedToEntityType: 1,
  assignedToEntityId: 1,
});
