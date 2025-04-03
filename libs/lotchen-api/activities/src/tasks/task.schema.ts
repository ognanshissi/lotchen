import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { TaskTypeEnum } from './task-type.enum';
import { ActivityBase } from '../common/activity-base.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema({
  collection: 'activities_tasks',
  timestamps: true,
})
export class Task extends ActivityBase {
  @Prop({
    required: true,
    enum: TaskTypeEnum,
    default: TaskTypeEnum.FollowUp,
    type: String,
  })
  taskType!: string;

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

TaskSchema.index({
  ownerId: 1,
  relatedToId: 1,
  relatedToType: 1,
  id: 1,
  taskType: 1,
});
