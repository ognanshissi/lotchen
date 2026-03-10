import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import mongoose from 'mongoose';

export type EventTypeDocument = mongoose.HydratedDocument<EventType>;

@Schema({
  collection: 'activities_event_types',
  timestamps: true,
})
export class EventType extends AggregateRoot {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, default: 'feather:calendar' })
  icon!: string;

  @Prop({ type: String, default: '#6366f1' })
  color!: string;

  @Prop({ type: Number, default: 30 })
  defaultDurationMinutes!: number;

  @Prop({ type: [String], default: [] })
  requiredFields!: string[];

  @Prop({ type: Boolean, default: false })
  isSystem!: boolean;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const EventTypeSchema = SchemaFactory.createForClass(EventType);
