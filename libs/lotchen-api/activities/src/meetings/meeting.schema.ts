import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ActivityBase } from '../common/activity-base.schema';
import mongoose from 'mongoose';

export type MeetingDocument = mongoose.HydratedDocument<Meeting>;

@Schema({
  collection: 'activities_meetings',
  timestamps: true,
})
export class Meeting extends ActivityBase {
  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  startAt!: { date: Date; time: string };

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  endAt!: { date: Date; time: string };

  @Prop({ type: String })
  meetingTimeZone!: string;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: false })
  description!: string;

  @Prop({ type: ['UUID'], ref: 'User' })
  attendees!: string[];

  @Prop({ type: String, default: '' })
  zoomVideoConferencingUrl!: string;

  @Prop({ type: String, default: '' })
  teamsVideoConferencingUrl!: string;

  @Prop({ type: String, default: '' })
  location!: string;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
