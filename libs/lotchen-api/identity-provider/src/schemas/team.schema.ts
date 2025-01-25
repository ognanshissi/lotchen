import { AuditableSchema } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { Agency } from './agency.schema';

@Schema({ collection: 'identity_teams', timestamps: true })
export class Team extends AuditableSchema {
  @Prop({ unique: true, type: String })
  name!: string;
  @Prop({
    type: [{ type: mongoose.Schema.Types.UUID, ref: 'User' }],
    default: [],
  })
  users!: User[];

  @Prop({ type: mongoose.Schema.Types.UUID, ref: 'Agency' })
  agency!: Agency;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
