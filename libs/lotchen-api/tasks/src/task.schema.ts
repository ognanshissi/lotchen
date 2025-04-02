import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import mongoose, { HydratedDocument } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({
  collection: 'task_tasks',
  timestamps: true,
})
export class Task extends AggregateRoot {
  @Prop({
    required: true,
    enum: ['follow up', 'call reminder'],
    default: 'follow up',
    type: String,
  })
  taskType!: string;

  @Prop({ type: 'UUID', required: true, ref: 'User' })
  ownerId!: string;

  @Prop({
    required: false,
    type: String,
    enum: ['Contact', 'Client', 'Product'],
  })
  relatedToType!: string;

  @Prop({ type: 'UUID', required: false })
  relatedToId!: string;

  @Prop({ required: false, type: Date, default: null })
  markAsCompletedAt!: Date;

  @Prop({ type: [mongoose.Schema.Types.UUID], ref: 'User' })
  collaboratorIds!: string[]; // Associated users that can see the task

  @Prop({ required: true, type: String })
  title!: string;

  @Prop({ required: false, type: String })
  description!: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  dueDate!: {
    date: Date;
    time: string;
  };
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ ownerId: 1, relatedToId: 1, relatedToType: 1, id: 1 });
