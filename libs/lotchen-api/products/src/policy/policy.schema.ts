import { AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  PolicyStatus,
  ClaimStatus,
  PaymentFrequency,
} from '../common/product.enums';

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class Beneficiary {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String })
  relationship?: string;

  @Prop({ type: Number })
  percentage?: number;
}

export const BeneficiarySchema = SchemaFactory.createForClass(Beneficiary);

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class Claim {
  @Prop({ type: String, required: true })
  claimNumber!: string;

  @Prop({
    type: String,
    enum: Object.values(ClaimStatus),
    default: ClaimStatus.Open,
  })
  status!: string;

  @Prop({ type: Number })
  amount?: number;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Date, default: Date.now })
  filedAt!: Date;

  @Prop({ type: Date })
  resolvedAt?: Date;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);

@Schema({ collection: 'policies', timestamps: true })
export class Policy extends AggregateRoot {
  @Prop({ type: String, required: true, unique: true })
  policyNumber!: string;

  @Prop({ type: String, required: true })
  productId!: string;

  @Prop({ type: String, required: true })
  contactId!: string;

  @Prop({
    type: String,
    enum: Object.values(PolicyStatus),
    default: PolicyStatus.Quote,
  })
  status!: string;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: Number })
  premiumAmount?: number;

  @Prop({ type: String, enum: Object.values(PaymentFrequency) })
  paymentFrequency?: string;

  @Prop({ type: [BeneficiarySchema], default: [] })
  beneficiaries!: Beneficiary[];

  @Prop({ type: [ClaimSchema], default: [] })
  claims!: Claim[];

  @Prop({ type: Date })
  renewalDate?: Date;

  @Prop({ type: String })
  notes?: string;
}

export const PolicySchema = SchemaFactory.createForClass(Policy);
export type PolicyDocument = HydratedDocument<Policy>;
