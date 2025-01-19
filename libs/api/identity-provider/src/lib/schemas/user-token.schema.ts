import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import * as mongoose from 'mongoose';

export type UserTokenType = HydratedDocument<UserToken>;

@Schema({ timestamps: true, collection: 'identity_user_tokens' })
export class UserToken {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user!: User;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: null })
  usedAt!: Date | null;

  @Prop({ type: String })
  aim!: string;
}

export const UserTokenSchema = SchemaFactory.createForClass(UserToken);
