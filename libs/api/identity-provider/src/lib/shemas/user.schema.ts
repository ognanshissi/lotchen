import { HydratedDocument } from 'mongoose';
import { Prop, Schema } from '@nestjs/mongoose';
import { AuditableSchema } from '@lotchen/api/core';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends AuditableSchema {
  @Prop()
  password!: string;
  @Prop({ unique: true })
  email!: string;
  @Prop()
  roles!: string[];
  @Prop()
  permissions!: string[];
  @Prop()
  isActive!: boolean;
  @Prop()
  isVerified!: boolean;
  @Prop()
  isLocked!: boolean;

  @Prop()
  isSuperAdmin!: boolean;

  @Prop()
  isSystemAdmin!: boolean;
}
