import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';

export type DispatchAuditLogDocument = HydratedDocument<DispatchAuditLog>;

@Schema({ collection: 'dispatch_audit_logs', timestamps: true })
export class DispatchAuditLog {
  @Prop({ type: 'UUID', default: () => randomUUID() })
  _id!: string;

  @Prop({ required: true, type: 'UUID', index: true })
  ruleId!: string;

  @Prop({ required: true, type: String })
  ruleName!: string;

  @Prop({ required: true, type: String })
  objectType!: string;

  @Prop({ type: 'UUID' })
  objectId?: string;

  @Prop({ type: [String], default: [] })
  matchedConditions!: string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  assignedTarget?: {
    type: string;
    targetId: string;
    isFallback: boolean;
  };

  @Prop({ type: String, enum: ['system', 'manual'], default: 'system' })
  triggeredBy!: string;

  @Prop({ type: Date })
  createdAt!: Date;

  @Prop({ type: Date })
  updatedAt!: Date;
}

export const DispatchAuditLogSchema =
  SchemaFactory.createForClass(DispatchAuditLog);

DispatchAuditLogSchema.index({ ruleId: 1, createdAt: -1 });
DispatchAuditLogSchema.index({ objectType: 1, createdAt: -1 });
