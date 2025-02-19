import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import { Organization } from './organization.schema';
import { User } from '../users';

@Schema({ collection: 'identity_organization_users', timestamps: true })
export class OrganizationUsers extends AggregateRoot {
  @Prop({ type: Organization })
  organization!: Organization;

  @Prop({ type: User })
  user!: User;

  @Prop({ type: Date })
  invitedAt!: Date;

  @Prop({ type: Date, default: null })
  joinedAt!: Date | null;

  @Prop({ type: Date, default: null })
  revokedAt!: Date;
}

export const OrganizationUsersSchema =
  SchemaFactory.createForClass(OrganizationUsers);
