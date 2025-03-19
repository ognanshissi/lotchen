import { SchemaIdentifier } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CallLogDocument = HydratedDocument<CallLog>;

@Schema({ timestamps: true, collection: 'contact_call_logs' })
export class CallLog extends SchemaIdentifier {
  @Prop({ type: String, enum: ['Contact', 'Client'], default: 'Contact' })
  entityType!: string;

  @Prop({ type: 'UUID' })
  toId!: string;

  @Prop({ type: String })
  toContact!: string;

  @Prop({ type: String })
  callSid!: string;

  @Prop({ type: 'UUID', required: true })
  fromId!: string; // Agent making the call

  @Prop({ type: Number, default: 0 })
  duration!: number; // seconds

  @Prop({ type: Date, default: Date.now })
  startDate!: Date;

  @Prop({ type: Date })
  endDate!: Date;

  @Prop({ type: String, enum: ['completed', 'replied', 'no-reply'] })
  status!: string;
}

export const CallLogSchema = SchemaFactory.createForClass(CallLog);
