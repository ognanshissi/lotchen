import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  AggregateRoot,
  LanguageEnum,
  Point,
  PointSchema,
} from '@lotchen/api/core';

@Schema({ collection: 'identity_territories', timestamps: true })
export class Territory extends AggregateRoot {
  @Prop({ type: String })
  name!: string;

  @Prop({
    type: String,
    default: LanguageEnum.FR,
    enum: LanguageEnum,
  })
  defaultLanguage!: LanguageEnum;

  @Prop({ type: String, default: 'MM/dd/YYYY' })
  defaultDateFormat!: string;

  @Prop({ type: PointSchema, required: false })
  location!: Point;
}

export const TerritorySchema = SchemaFactory.createForClass(Territory);
