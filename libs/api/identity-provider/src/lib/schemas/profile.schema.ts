import { AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import { ContactInfo } from './contact-info';

export type ProfileDocument = HydratedDocument<Profile>;

export enum LanguageEnum {
  FR = 'fr-FR',
  EN = 'en-US',
}

@Schema({ timestamps: true, collection: 'identity_profiles' })
export class Profile extends AggregateRoot {
  @Prop({ type: mongoose.Schema.Types.UUID, ref: 'User', required: true })
  user!: User;

  @Prop()
  firstName!: string;

  @Prop()
  lastName!: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  contactInfo!: ContactInfo;

  @Prop()
  dateOfBirth!: Date;

  @Prop()
  profilePictureUrl!: string;

  @Prop({
    type: String,
    default: LanguageEnum.FR,
  })
  defaultLanguage!: LanguageEnum;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
