import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles';
import { Team, TeamSchema } from '../teams';

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
    type: [String],
  })
  permissions!: string[];

  @Prop({ default: true, type: Boolean })
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

  @Prop({ default: null, type: Date })
  isEmailConfirmedAt!: Date | null;

  @Prop({ default: null, type: Date })
  resetPasswordSentAt!: Date | null;

  @Prop()
  salt!: string;

  @Prop({ type: [TeamSchema] })
  teams!: Team[];

  @Prop({
    type: mongoose.Schema.Types.UUID,
    ref: 'User',
  })
  reportedTo!: User; // Superior, person to report to
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
