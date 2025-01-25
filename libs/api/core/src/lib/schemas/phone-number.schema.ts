import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: false })
export class PhoneNumber {
  @Prop({ type: Date, default: null })
  isConfirmedAt!: Date | null;
  @Prop({ type: String })
  contact!: string;
  @Prop({ type: Boolean })
  isPrimary!: boolean;
}

export const PhoneNumberSchema = SchemaFactory.createForClass(PhoneNumber);
