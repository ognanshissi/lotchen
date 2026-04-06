import {
  Address,
  AddressSchema,
  AggregateRoot,
  Amount,
  AmountSchema,
} from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ClientStatus, KycStatus, AccountType } from '../common/client.enums';

export type ClientDocument = HydratedDocument<Client>;

@Schema({ collection: 'clients', timestamps: true })
export class Client extends AggregateRoot {
  @Prop({ type: String, required: true, unique: true })
  clientNumber!: string;

  @Prop({ type: 'UUID', required: true })
  contactId!: string;

  @Prop({ type: String, required: true })
  firstName!: string;

  @Prop({ type: String, required: true })
  lastName!: string;

  @Prop({ type: String })
  email?: string;

  @Prop({ type: String, required: true })
  mobileNumber!: string;

  @Prop({ type: String, default: null })
  phone?: string;

  @Prop({ type: Date })
  dateOfBirth?: Date;

  @Prop({ type: String, enum: ['Male', 'Female'], default: null })
  gender?: string;

  @Prop({ type: String, default: null })
  jobTitle?: string;

  @Prop({ type: String, default: null })
  companyName?: string;

  @Prop({ type: [AddressSchema], default: [] })
  addresses!: Address[];

  @Prop({ type: String, default: null })
  source?: string;

  @Prop({
    type: String,
    enum: Object.values(ClientStatus),
    default: ClientStatus.Active,
  })
  status!: string;

  @Prop({
    type: String,
    enum: Object.values(KycStatus),
    default: KycStatus.NotStarted,
  })
  kycStatus!: string;

  @Prop({
    type: String,
    enum: Object.values(AccountType),
    default: AccountType.Individual,
  })
  accountType!: string;

  @Prop({ type: Date })
  onboardingDate?: Date;

  @Prop({ type: Number })
  creditScore?: number;

  @Prop({ type: AmountSchema })
  monthlyIncome?: Amount;

  @Prop({ type: String })
  employmentStatus?: string;

  @Prop({ type: 'UUID', default: null })
  assignedToUserId?: string;

  @Prop({ type: 'UUID', default: null })
  assignedToTeamId?: string;

  @Prop({ type: 'UUID', default: null })
  territoryId?: string;

  @Prop({ type: 'UUID', default: null })
  agencyId?: string;

  @Prop({ type: [String], default: [] })
  productIds!: string[];

  @Prop({ type: [String], default: [] })
  policyIds!: string[];

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Map, of: String })
  customFields?: Record<string, string>;

  @Prop({ type: [String], default: [] })
  notes!: string[];
}

export const ClientSchema = SchemaFactory.createForClass(Client);

ClientSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  mobileNumber: 'text',
  clientNumber: 'text',
});
