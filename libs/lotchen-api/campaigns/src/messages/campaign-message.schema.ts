import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import { CampaignChannel, MessageStatus } from '../common/campaign.enums';

export type CampaignMessageDocument = HydratedDocument<CampaignMessage>;

@Schema({ collection: 'campaign_messages', timestamps: true })
export class CampaignMessage extends AggregateRoot {
  @Prop({ required: true, type: String })
  campaignId!: string;

  @Prop({ required: true, type: String })
  contactId!: string;

  @Prop({ type: String })
  contactName?: string;

  @Prop({ type: String })
  contactEmail?: string;

  @Prop({ type: String })
  contactPhone?: string;

  @Prop({ required: true, type: String, enum: CampaignChannel })
  channel!: CampaignChannel;

  @Prop({ type: String, enum: MessageStatus, default: MessageStatus.Pending })
  status!: MessageStatus;

  @Prop({ type: Date })
  sentAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date })
  openedAt?: Date;

  @Prop({ type: Date })
  clickedAt?: Date;

  @Prop({ type: Date })
  bouncedAt?: Date;

  @Prop({ type: Date })
  unsubscribedAt?: Date;

  @Prop({ type: String })
  failureReason?: string;

  @Prop({ type: String })
  externalMessageId?: string;
}

export const CampaignMessageSchema =
  SchemaFactory.createForClass(CampaignMessage);

CampaignMessageSchema.index({ campaignId: 1, status: 1 });
CampaignMessageSchema.index({ contactId: 1 });
CampaignMessageSchema.index({ campaignId: 1, contactId: 1 }, { unique: true });
