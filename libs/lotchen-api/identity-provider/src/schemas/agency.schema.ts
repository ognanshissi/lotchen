import { Address, AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Territory } from './territory.schema';
import * as mongoose from 'mongoose';

@Schema({ collection: 'identity_agencies', timestamps: true })
export class Agency extends AggregateRoot {
  @Prop({
    type: Address,
  })
  address!: Address;

  @Prop({ type: mongoose.Schema.Types.UUID, ref: 'territory' })
  territory!: Territory;
}

export const AgencySchema = SchemaFactory.createForClass(Agency);
