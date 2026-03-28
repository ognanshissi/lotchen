import { AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  ProductType,
  ProductStatus,
  InsuranceType,
  Environment,
  PaymentFrequency,
} from '../common/product.enums';

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class ProductFee {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({ type: String, enum: ['fixed', 'percentage'], required: true })
  type!: string;
}

export const ProductFeeSchema = SchemaFactory.createForClass(ProductFee);

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class ProductVariant {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Number })
  interestRate?: number;

  @Prop({ type: Number })
  duration?: number;

  @Prop({ type: [ProductFeeSchema], default: [] })
  fees!: ProductFee[];
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class PremiumStructure {
  @Prop({ type: Number })
  basePremium?: number;

  @Prop({ type: String, enum: Object.values(PaymentFrequency) })
  frequency?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  ageFactors?: Record<string, number>;
}

export const PremiumStructureSchema =
  SchemaFactory.createForClass(PremiumStructure);

@Schema({ collection: 'products', timestamps: true })
export class Product extends AggregateRoot {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, enum: Object.values(ProductType), required: true })
  type!: string;

  @Prop({
    type: String,
    enum: Object.values(ProductStatus),
    default: ProductStatus.Draft,
  })
  status!: string;

  @Prop({
    type: String,
    enum: Object.values(Environment),
    default: Environment.Sandbox,
  })
  environment!: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Number })
  interestRate?: number;

  @Prop({ type: Number })
  duration?: number;

  @Prop({ type: [ProductFeeSchema], default: [] })
  fees!: ProductFee[];

  @Prop({ type: [String], default: [] })
  eligibilityCriteria!: string[];

  @Prop({ type: [ProductVariantSchema], default: [] })
  variants!: ProductVariant[];

  @Prop({ type: String, enum: Object.values(InsuranceType) })
  insuranceType?: string;

  @Prop({ type: PremiumStructureSchema })
  premiumStructure?: PremiumStructure;

  @Prop({ type: String })
  coverage?: string;

  @Prop({ type: Number })
  deductible?: number;

  @Prop({ type: String })
  terms?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ type: Date })
  promotedAt?: Date;

  @Prop({ type: String })
  promotedBy?: string;

  @Prop({ type: Number, default: 0 })
  testRunCount!: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export type ProductDocument = HydratedDocument<Product>;
