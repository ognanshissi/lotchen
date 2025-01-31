import { AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../users';

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

  @Prop({
    type: mongoose.Schema.Types.UUID,
    ref: 'User',
    required: false,
  })
  manager!: User;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
