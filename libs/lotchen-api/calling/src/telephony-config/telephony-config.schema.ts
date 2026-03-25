import { AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  TelephonyProvider,
  RecordingConsentMode,
} from '../common/calling.enums';

export type TelephonyConfigDocument = HydratedDocument<TelephonyConfig>;

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class TwilioConfig {
  @Prop({ type: String, default: '' })
  accountSid!: string;

  @Prop({ type: String, default: '' })
  apiKey!: string;

  @Prop({ type: String, default: '' })
  apiSecret!: string;

  @Prop({ type: String, default: '' })
  twimlAppSid!: string;

  @Prop({ type: String, default: '' })
  callerId!: string;
}

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class RingOverConfig {
  @Prop({ type: String, default: '' })
  apiKey!: string;

  @Prop({ type: String, default: '' })
  teamId!: string;

  @Prop({ type: String, default: '' })
  webhookSecret!: string;
}

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class AsteriskConfig {
  @Prop({ type: String, default: '' })
  serverHost!: string;

  @Prop({ type: Number, default: 5060 })
  serverPort!: number;

  @Prop({ type: String, default: '' })
  wsUrl!: string;

  @Prop({ type: String, default: '' })
  sipDomain!: string;

  @Prop({ type: String, default: '' })
  sipTrunkProvider!: string;

  @Prop({ type: String, default: '' })
  stunServer!: string;

  @Prop({ type: String, default: '' })
  turnServer!: string;

  @Prop({ type: String, default: '' })
  turnUsername!: string;

  @Prop({ type: String, default: '' })
  turnPassword!: string;
}

@Schema({ collection: 'telephony_configs', timestamps: true })
export class TelephonyConfig extends AggregateRoot {
  @Prop({
    type: String,
    enum: Object.values(TelephonyProvider),
    default: TelephonyProvider.Twilio,
  })
  provider!: string;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  twilioConfig?: TwilioConfig | null;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  ringoverConfig?: RingOverConfig | null;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  asteriskConfig?: AsteriskConfig | null;

  @Prop({ type: Boolean, default: false })
  recordingEnabled!: boolean;

  @Prop({
    type: String,
    enum: Object.values(RecordingConsentMode),
    default: RecordingConsentMode.Disabled,
  })
  recordingConsent!: string;
}

export const TelephonyConfigSchema =
  SchemaFactory.createForClass(TelephonyConfig);
