import { Address, AddressSchema, AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Territory } from './territory.schema';
import * as mongoose from 'mongoose';

@Schema({ timestamps: false, id: false, _id: false })
export class AgencyOption {
  @Prop({
    default: 10,
    type: Number,
  })
  dailyLeadsQuota!: number;
}

export const AgencyOptionSchema = SchemaFactory.createForClass(AgencyOption);

@Schema({ collection: 'identity_agencies', timestamps: true })
export class Agency extends AggregateRoot {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  name!: string;

  @Prop({
    type: AddressSchema,
  })
  address!: Address;

  @Prop({
    type: Boolean,
    default: false,
  })
  isPrincipalAgency!: boolean;

  @Prop({ type: AgencyOptionSchema })
  options!: AgencyOption;

  @Prop({ type: mongoose.Schema.Types.UUID, ref: 'Territory' })
  territory!: Territory;
}

export const AgencySchema = SchemaFactory.createForClass(Agency);
