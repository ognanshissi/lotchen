import { Address, AddressSchema, AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ContactStatus } from './contact-status.enum';
import {
  ContactStatusHistory,
  ContactStatusHistorySchema,
} from './contact-status-history.schema';

export type ContactDocument = HydratedDocument<Contact>;

export enum ContactTypeEnum {
  Lead = 'Lead',
  Prospect = 'Prospect',
}

export type contactSource =
  | 'Website'
  | 'Referral'
  | 'Social Media'
  | 'Event'
  | 'Cold Call'
  | 'Email'
  | 'Back Office'
  | 'LinkedIn'
  | 'Facebook'
  | 'Twitter'
  | 'Google'
  | 'Instagram'
  | 'YouTube'
  | 'Pinterest'
  | 'Snapchat'
  | 'TikTok'
  | 'Reddit'
  | 'Quora'
  | 'Yelp'
  | 'Campaign'
  | 'Other';

@Schema({ timestamps: true, collection: 'contact_contacts' }) // Stores contact information
export class Contact extends AggregateRoot {
  @Prop({ type: String, enum: ['Male', 'Female'], default: null })
  gender!: string;

  @Prop({ required: true }) // Stores first name
  firstName!: string;

  @Prop({ required: true }) // Stores last name
  lastName!: string;

  @Prop({ unique: true }) // Stores email
  email!: string;

  @Prop({ required: false }) // Stores hashed contact on information
  hash!: string;

  @Prop({ required: true }) // Stores phone number
  mobileNumber!: string;

  @Prop({ type: Date }) // Stores date of birth
  dateOfBirth!: Date;

  @Prop({ type: String, default: null })
  jobTitle!: string;

  @Prop({ type: [AddressSchema], required: false }) // Stores address
  addresses!: [Address];

  @Prop({ required: true, type: String, default: 'Back Office' }) // Stores origin
  source!: contactSource;

  @Prop({
    type: String,
    enum: ContactTypeEnum,
    default: ContactTypeEnum.Lead,
  })
  type!: ContactTypeEnum;

  @Prop({ type: String, enum: ContactStatus, default: ContactStatus.New })
  status!: ContactStatus;

  @Prop({ type: [ContactStatusHistorySchema], default: [] })
  statusHistory!: ContactStatusHistory[];

  // Prospect
  @Prop({ type: Number })
  creditScore?: number;

  @Prop({ type: Number })
  monthlyIncome?: number;

  @Prop({ type: String })
  employmentStatus?: 'Employed' | 'Self-Employed' | 'Unemployed';

  @Prop({ type: Number })
  requestedLoanAmount?: number;

  @Prop()
  loanPurpose?: string;

  @Prop({ type: Number })
  repaymentPeriod?: number;

  @Prop({ default: null, type: Date }) // Indicates if they have been converted to a client
  isConvertedToClientAt!: Date;

  @Prop({ type: String }) // Reference to the new client ID
  clientId?: string;

  // Assigned Team/User
  @Prop({ type: 'UUID', default: null, required: false })
  assignedToUserId?: string; // Sales representative

  @Prop({ type: 'UUID', default: null, required: false })
  assignedToTeamId?: string;

  @Prop({ type: 'UUID', default: null, required: false })
  territoryId?: string;

  @Prop({ type: Map, of: String }) // Stores custom fields
  customFields!: Record<string, string>;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

// Create indexes for full-text search
ContactSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  mobileNumber: 'text',
});
