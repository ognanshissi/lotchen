import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { SchemaIdentifier } from '@lotchen/api/core';

export type UserTokenType = HydratedDocument<UserToken>;

@Schema({ timestamps: true, collection: 'identity_user_tokens' })
export class UserToken extends SchemaIdentifier {
  @Prop({ type: Types.UUID, ref: 'User', required: true })
  user!: User;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: null })
  revokedAt!: Date | null;

  @Prop({ type: String })
  aim!: string;
}

export const UserTokenSchema = SchemaFactory.createForClass(UserToken);
