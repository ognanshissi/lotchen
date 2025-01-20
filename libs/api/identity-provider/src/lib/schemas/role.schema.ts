import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Permission } from './permission.schema';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ collection: 'identity_roles', timestamps: true })
export class Role {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: [Permission] })
  permissions!: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
