import { ActivityUser, AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../users';
import { Territory } from '../territories/territory.schema';

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

  // Reference
  @Prop({ type: mongoose.Schema.Types.UUID, ref: 'Territory' })
  territoryId!: Territory;

  // Useful for quick territory information
  @Prop({ type: Object, default: null })
  territoryInfo!: { name: string; id: string };

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
