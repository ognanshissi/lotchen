import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ collection: 'identity_permissions', timestamps: true })
export class Permission {
  @Prop({ required: true })
  code!: string;

  @Prop()
  description!: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
