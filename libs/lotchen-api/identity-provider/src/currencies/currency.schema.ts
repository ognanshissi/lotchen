import { AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'identity_currencies', timestamps: true })
export class Currency extends AggregateRoot {
  @Prop({ type: String, required: true })
  code!: string;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Number, required: true, default: 1 })
  rate!: number;

  @Prop({ type: String, required: true })
  symbol!: string;

  @Prop({ type: Boolean, default: false })
  isDefault!: boolean;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
export type CurrencyDocument = Currency & Document;
