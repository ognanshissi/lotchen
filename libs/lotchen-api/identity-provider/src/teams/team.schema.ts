import { ActivityUser, AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../users';
import { Territory } from '../territories/territory.schema';

@Schema({ timestamps: false, id: false, _id: false })
export class TerritoryInfo {
  @Prop({ type: String })
  name!: string;
  @Prop({ type: 'UUID' })
  id!: string;
}

@Schema({ collection: 'identity_teams', timestamps: true })
export class Team extends AggregateRoot {
  @Prop({ unique: true, type: String })
  name!: string;

  @Prop({ type: String })
  description!: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.UUID, ref: 'User' }],
    default: [],
  })
  members!: User[];

  // Reference - suitable to populate the entire territory information
  @Prop({ type: mongoose.Schema.Types.UUID, ref: 'Territory' })
  territoryId!: Territory;

  // Useful for quick territory information
  @Prop({ type: TerritoryInfo, default: null })
  territoryInfo!: TerritoryInfo;

  @Prop({
    type: mongoose.Schema.Types.UUID,
    ref: 'User',
    required: false,
  })
  manager!: User;

  @Prop({ type: ActivityUser, required: true })
  managerInfo!: ActivityUser;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
