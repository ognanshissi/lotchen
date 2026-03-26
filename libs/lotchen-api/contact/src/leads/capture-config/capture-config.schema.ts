import { AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';

export type CaptureConfigDocument = HydratedDocument<CaptureConfig>;

export type CaptureConfigPlatform =
  | 'website'
  | 'linkedin'
  | 'facebook'
  | 'google-forms';

export type RoutingRuleType = 'fixed' | 'round-robin';

@Schema({ _id: false, versionKey: false })
export class RoutingRule {
  @Prop({
    type: String,
    enum: ['fixed', 'round-robin'],
    required: true,
  })
  type!: RoutingRuleType;

  @Prop({ type: 'UUID', default: null })
  assignToUserId!: string | null;

  @Prop({ type: 'UUID', default: null })
  assignToTeamId!: string | null;

  @Prop({ type: Number, default: 0 })
  lastAssignedIndex!: number;
}

export const RoutingRuleSchema = SchemaFactory.createForClass(RoutingRule);

@Schema({ timestamps: true, collection: 'lead_capture_configs' })
export class CaptureConfig extends AggregateRoot {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({
    required: true,
    type: String,
    enum: ['website', 'linkedin', 'facebook', 'google-forms'],
  })
  platform!: CaptureConfigPlatform;

  @Prop({
    required: true,
    type: String,
    unique: true,
    default: () => randomUUID(),
  })
  apiKey!: string;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: [String], default: [] })
  allowedDomains!: string[];

  @Prop({ type: Map, of: String, default: {} })
  fieldMapping!: Map<string, string>;

  @Prop({ type: RoutingRuleSchema, default: null })
  routingRule!: RoutingRule | null;
}

export const CaptureConfigSchema = SchemaFactory.createForClass(CaptureConfig);
