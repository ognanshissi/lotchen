import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ActivityBase } from '../common/activity-base.schema';

export type NoteDocument = HydratedDocument<Note>;

@Schema({
  collection: 'activities_notes',
  timestamps: true,
})
export class Note extends ActivityBase {
  @Prop({ required: true, type: String })
  content!: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
