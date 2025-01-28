import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  AggregateRoot,
  LanguageEnum,
  Point,
  PointSchema,
} from '@lotchen/api/core';
import { Agency } from './agency.schema';
import * as mongoose from 'mongoose';

@Schema({ collection: 'identity_territories', timestamps: true })
export class Territory extends AggregateRoot {
  @Prop({ type: String, unique: true })
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

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.UUID,
        ref: 'Agency',
      },
    ],
  })
  agencies!: Agency[];
}

export const TerritorySchema = SchemaFactory.createForClass(Territory);
