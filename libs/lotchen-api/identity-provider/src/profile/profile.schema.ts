import { AggregateRoot, LanguageEnum } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../users/user.schema';
import { ContactInfo } from './contact-info';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ timestamps: true, collection: 'identity_profiles' })
export class Profile extends AggregateRoot {
  @Prop({ type: Types.UUID, ref: 'User', required: true })
  user!: User;

  @Prop()
  firstName!: string;

  @Prop()
  lastName!: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  contactInfo!: ContactInfo;

  @Prop({ type: Date, default: null })
  dateOfBirth!: Date;

  @Prop({ type: String })
  profilePictureUrl!: string;

  @Prop({
    type: String,
    default: LanguageEnum.FR,
    enum: LanguageEnum,
  })
  defaultLanguage!: LanguageEnum;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
