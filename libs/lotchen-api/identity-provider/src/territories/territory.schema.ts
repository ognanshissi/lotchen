import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  AggregateRoot,
  LanguageEnum,
  Point,
  PointSchema,
} from '@lotchen/api/core';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from '../users';
import { Team } from '../teams';

export type TerritoryDocument = HydratedDocument<Territory>;

@Schema({ collection: 'identity_territories', timestamps: true })
export class Territory extends AggregateRoot {
  @Prop({ type: String, unique: true, index: true })
  name!: string;

  @Prop({ type: String })
  description!: string;

  @Prop({ type: Boolean, default: false })
  isLocal!: boolean;

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
        ref: 'Territory',
      },
    ],
  })
  children!: Territory[];

  @Prop({ type: [String] })
  childrenNames!: string[];

  @Prop({ type: String })
  parentName!: string;

  @Prop({
    type: mongoose.Schema.Types.UUID,
    ref: 'Territory',
  })
  parent!: Territory;

  // users
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.UUID,
        ref: 'User',
      },
    ],
  })
  users!: User[];
  // teams
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.UUID,
        ref: 'Team',
      },
    ],
  })
  teams!: Team[];
}

export const TerritorySchema = SchemaFactory.createForClass(Territory);
