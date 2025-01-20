import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'identity_users' })
export class User extends AggregateRoot {
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
  @Prop({ default: false })
  isVerified!: boolean;
  @Prop({ default: false })
  isLocked!: boolean;

  @Prop({ default: false })
  isSuperAdmin!: boolean;

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
