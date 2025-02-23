import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ILocaleText } from '../interfaces';

@Schema({ timestamps: false, id: false, _id: false })
export class LocaleText implements ILocaleText {
  @Prop({ type: String, required: true })
  fr!: string;

  @Prop({ type: String, required: true })
  en!: string;
}

export const LocaleTextSchema = SchemaFactory.createForClass(LocaleText);
