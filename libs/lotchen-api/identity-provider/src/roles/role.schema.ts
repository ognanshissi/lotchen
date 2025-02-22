import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaIdentifier } from '@lotchen/api/core';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ collection: 'identity_roles', timestamps: true })
export class Role extends SchemaIdentifier {
  @Prop({ type: Boolean, default: false })
  builtIn!: boolean; // The permissions associate to a build role can't be edited

  @Prop({ type: String, required: true, unique: true })
  name!: string;

  @Prop({ type: [String] })
  permissions!: string[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
