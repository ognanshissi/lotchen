import { SchemaIdentifier } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CallLogDocument = HydratedDocument<CallLog>;
export enum CallLogStatus {
  Failed = 'failed',
  Completed = 'completed',
  Replied = 'replied',
  NoReply = 'no-reply',
  Cancelled = 'cancelled',
}
@Schema({ timestamps: true, collection: 'contact_call_logs' })
export class CallLog extends SchemaIdentifier {
  @Prop({ type: String, enum: ['Contact', 'Client'], default: 'Contact' })
  entityType!: string;

  @Prop({ type: 'UUID' })
  relatedToId!: string; // call is relatedto this entry ()

  @Prop({ type: String })
  recipientContact!: string;

  @Prop({ type: String })
  callSid!: string;

  @Prop({ type: 'UUID', required: true, ref: 'User' })
  fromAgentId!: string; // Agent who placed the call

  // Quick access to the user who placed the call -> commonly the connected user
  @Prop({ type: mongoose.Schema.Types.Mixed })
  fromAgentLite!: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @Prop({ type: Number, default: 0 })
  duration!: number; // seconds

  @Prop({ type: Date, default: Date.now })
  startDate!: Date;

  @Prop({ type: Date })
  endDate!: Date;

  @Prop({
    type: String,
    enum: ['failed', 'cancelled', 'completed', 'replied', 'no-reply'],
  })
  status!: CallLogStatus;

  @Prop({ type: String, default: '' })
  note!: string;

  @Prop({ type: String, default: '' })
  recordingUrl!: string;

  @Prop({ type: String, default: '' })
  recordingSid!: string;

  @Prop({ type: String, default: '' })
  callError!: string;
}

export const CallLogSchema = SchemaFactory.createForClass(CallLog);

CallLogSchema.index({ toId: 1, fromId: 1, entityType: 1 });
