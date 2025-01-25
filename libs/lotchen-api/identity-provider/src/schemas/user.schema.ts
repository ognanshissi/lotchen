import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import * as bcrypt from 'bcrypt';
import { Role } from './role.schema';
import { Permission } from './permission.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'identity_users' })
export class User extends AggregateRoot {
  @Prop()
  password!: string;

  @Prop({ unique: true })
  email!: string;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.UUID,
        ref: 'Role',
      },
    ],
  })
  roles!: Role[];

  @Prop({
    type: [Permission],
  })
  permissions!: Permission[];

  @Prop()
  isActive!: boolean;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ default: false })
  isLocked!: boolean;

  /**
   * The person who initiate le the tenant
   *
   */
  @Prop({ default: false })
  isSuperAdmin!: boolean;

  /**
   *
   * As the app is focused for employee only
   */
  @Prop({ default: true })
  isStaff!: boolean;

  /**
   * For hidden user / can access everything
   *
   */
  @Prop({ default: false })
  isSystemAdmin!: boolean;

  @Prop({ default: false, type: Boolean })
  isEmailConfirmed!: boolean;

  @Prop()
  salt!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export class UserExtension {
  public static async generatePasswordHash(
    password: string
  ): Promise<{ encryptedPassword: string; salt: string }> {
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    return { encryptedPassword, salt };
  }

  public static async comparePassword(
    password: string,
    encryptedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, encryptedPassword);
  }
}
