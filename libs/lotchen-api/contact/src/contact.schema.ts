import { Address, AddressSchema, AggregateRoot } from '@lotchen/api/core';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactDocument = HydratedDocument<Contact>;

export type contactSource =
  | 'Website'
  | 'Referral'
  | 'Social Media'
  | 'Event'
  | 'Cold Call'
  | 'Email'
  | 'Application'
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

  @Prop({ type: AddressSchema, required: false }) // Stores address
  address!: Address;

  @Prop({ required: true, type: String, default: 'Application' }) // Stores origin
  source!: contactSource;

  // Assigned Team/User
  @Prop({ type: 'UUID', default: null, required: false })
  assignedToUserId!: string; // Sales representative

  @Prop({ type: 'UUID', default: null, required: false })
  assignedToTeamId!: string;

  @Prop({ type: Map, of: String }) // Stores custom fields
  customFields!: Record<string, string>;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
