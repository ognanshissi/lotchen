import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaIdentifier } from '@lotchen/api/core';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ collection: 'identity_permissions' })
export class Permission extends SchemaIdentifier {
  @Prop({ required: true })
  code!: string;

  @Prop()
  description!: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
