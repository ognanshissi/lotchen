import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import {
  AssignmentTargetType,
  ConditionOperator,
  DispatchObjectType,
  DispatchRuleStatus,
  LogicalOperator,
  RoutingMethod,
} from './common/dispatch-rule.enums';

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class DispatchCondition {
  @Prop({ required: true, type: String })
  field!: string;

  @Prop({ required: true, enum: ConditionOperator, type: String })
  operator!: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  value!: any;
}

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class DispatchConditionGroup {
  @Prop({ required: true, enum: LogicalOperator, type: String })
  operator!: string;

  @Prop({ type: [mongoose.Schema.Types.Mixed], default: [] })
  conditions!: any[];
}

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class AssignmentTarget {
  @Prop({ required: true, enum: AssignmentTargetType, type: String })
  type!: string;

  @Prop({ required: true, type: 'UUID' })
  targetId!: string;

  @Prop({ type: Boolean, default: false })
  isFallback!: boolean;
}

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class RoutingStrategy {
  @Prop({ required: true, enum: RoutingMethod, type: String })
  method!: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  params!: Record<string, any>;
}

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class CapacityRules {
  @Prop({ type: Number })
  maxOpenTickets?: number;

  @Prop({ type: Number })
  maxDailyAssignments?: number;

  @Prop({ type: Number })
  concurrentThreshold?: number;
}

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class AvailabilityConfig {
  @Prop({ type: Boolean, default: false })
  respectBusinessHours!: boolean;

  @Prop({ type: String, default: 'UTC' })
  timeZone!: string;

  @Prop({ type: Boolean, default: false })
  excludeOnLeave!: boolean;
}

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class EscalationRule {
  @Prop({ type: String })
  trigger?: string;

  @Prop({ type: Number, default: 60 })
  delayMinutes!: number;

  @Prop({ type: 'UUID' })
  targetId?: string;

  @Prop({ type: Boolean, default: false })
  notifyOnEscalation!: boolean;
}

export type DispatchRuleDocument = HydratedDocument<DispatchRule>;

@Schema({ collection: 'dispatch_rules', timestamps: true })
export class DispatchRule extends AggregateRoot {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ type: String, default: '' })
  description!: string;

  @Prop({
    required: true,
    enum: DispatchRuleStatus,
    default: DispatchRuleStatus.Draft,
    type: String,
  })
  status!: string;

  @Prop({ required: true, enum: DispatchObjectType, type: String })
  objectType!: string;

  @Prop({ type: Number, default: 0 })
  priority!: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  conditions?: any;

  @Prop({ type: [AssignmentTarget], default: [] })
  targets!: AssignmentTarget[];

  @Prop({ type: RoutingStrategy })
  routingStrategy?: RoutingStrategy;

  @Prop({ type: CapacityRules })
  capacityRules?: CapacityRules;

  @Prop({ type: AvailabilityConfig })
  availabilityConfig?: AvailabilityConfig;

  @Prop({ type: [EscalationRule], default: [] })
  escalationRules!: EscalationRule[];

  @Prop({ type: Number, default: 1 })
  version!: number;

  @Prop({ type: [mongoose.Schema.Types.Mixed], default: [] })
  versionHistory!: any[];
}

export const DispatchRuleSchema = SchemaFactory.createForClass(DispatchRule);

DispatchRuleSchema.index({ status: 1 });
DispatchRuleSchema.index({ objectType: 1, status: 1 });
DispatchRuleSchema.index({ priority: 1, status: 1 });
