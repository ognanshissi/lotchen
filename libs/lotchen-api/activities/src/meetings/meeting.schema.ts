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

  @Prop({ type: String, default: 'Europe/London +00:00 GMT' })
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

  @Prop({ type: 'UUID', required: false })
  eventTypeId!: string;

  @Prop({
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'NoShow', 'Rescheduled'],
    default: 'Scheduled',
  })
  status!: string;

  @Prop({ type: String, required: false })
  outcome!: string;

  @Prop({ type: String, required: false })
  outcomeNotes!: string;

  @Prop({ type: 'UUID', required: false })
  followUpEventId!: string;

  @Prop({ type: Number, required: false, default: null })
  reminderMinutesBefore!: number;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
