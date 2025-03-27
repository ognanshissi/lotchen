import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ContactStatus } from './contact-status.enum';

@Schema({ timestamps: false })
export class ContactStatusHistory {
  @Prop({ type: String, enum: ContactStatus, default: ContactStatus.New })
  previousStatus!: ContactStatus;

  @Prop({ type: String, default: '', enum: ContactStatus })
  status!: ContactStatus;

  @Prop({ type: Date, default: Date.now })
  changedAt!: Date;

  @Prop({ type: 'UUID', ref: 'User' })
  changedBy!: string;
}

export const ContactStatusHistorySchema =
  SchemaFactory.createForClass(ContactStatusHistory);
