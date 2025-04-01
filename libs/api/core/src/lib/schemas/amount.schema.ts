import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: false, id: false, _id: false })
export class Amount {
  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({ type: String, required: true, default: 'USD' })
  currency!: string;

  @Prop({ type: String, default: '$' })
  currencySymbol!: string;

  @Prop({ type: Number, default: 1 })
  currencyConvertionRate?: number; // convertion rate to the base currency
}

export const AmountSchema = SchemaFactory.createForClass(Amount);
