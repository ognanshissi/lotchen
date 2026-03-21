import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import { CampaignChannel } from '../common/campaign.enums';

export type MessageTemplateDocument = HydratedDocument<MessageTemplate>;

@Schema({ collection: 'message_templates', timestamps: true })
export class MessageTemplate extends AggregateRoot {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: String, enum: CampaignChannel })
  channel!: CampaignChannel;

  @Prop({ type: String })
  subject?: string;

  @Prop({ required: true, type: String })
  body!: string;

  @Prop({ type: String })
  category?: string;

  @Prop({ type: [String], default: [] })
  mergeFields!: string[];

  @Prop({ type: Boolean })
  isWhatsAppApproved?: boolean;

  @Prop({ type: String })
  whatsAppTemplateId?: string;
}

export const MessageTemplateSchema =
  SchemaFactory.createForClass(MessageTemplate);

MessageTemplateSchema.index({ channel: 1 });
MessageTemplateSchema.index({ category: 1 });
