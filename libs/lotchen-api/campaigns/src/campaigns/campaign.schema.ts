import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import { CampaignChannel, CampaignStatus } from '../common/campaign.enums';

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class AudienceFilter {
  @Prop({ required: true, type: String })
  field!: string;

  @Prop({ required: true, type: String })
  operator!: string;

  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  value!: any;
}

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class CampaignStats {
  @Prop({ type: Number, default: 0 })
  total!: number;

  @Prop({ type: Number, default: 0 })
  sent!: number;

  @Prop({ type: Number, default: 0 })
  delivered!: number;

  @Prop({ type: Number, default: 0 })
  bounced!: number;

  @Prop({ type: Number, default: 0 })
  opened!: number;

  @Prop({ type: Number, default: 0 })
  clicked!: number;

  @Prop({ type: Number, default: 0 })
  unsubscribed!: number;

  @Prop({ type: Number, default: 0 })
  failed!: number;
}

export type CampaignDocument = HydratedDocument<Campaign>;

@Schema({ collection: 'campaigns', timestamps: true })
export class Campaign extends AggregateRoot {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: String, enum: CampaignChannel })
  channel!: CampaignChannel;

  @Prop({ type: String, enum: CampaignStatus, default: CampaignStatus.Draft })
  status!: CampaignStatus;

  @Prop({ type: String })
  templateId?: string;

  @Prop({ type: String })
  subject?: string;

  @Prop({ type: String })
  body?: string;

  @Prop({ type: [AudienceFilter], default: [] })
  audienceFilters!: AudienceFilter[];

  @Prop({ type: Number, default: 0 })
  audienceCount!: number;

  @Prop({ type: Date })
  scheduledAt?: Date;

  @Prop({ type: Date })
  sentAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: CampaignStats, default: () => ({}) })
  stats!: CampaignStats;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

CampaignSchema.index({ status: 1 });
CampaignSchema.index({ channel: 1 });
CampaignSchema.index({ scheduledAt: 1 });
