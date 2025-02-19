import { AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'identity_organizations', timestamps: true })
export class Organization extends AggregateRoot {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String })
  description!: string;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

// One user can belong to many organisations
