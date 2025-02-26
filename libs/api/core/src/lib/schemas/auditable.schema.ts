import { Prop, Schema } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import mongoose, { Document } from 'mongoose';

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class ActivityUser {
  @Prop({ type: 'UUID' })
  userId!: string;
  @Prop({ type: String })
  firstName!: string;
  @Prop({ type: String })
  lastName!: string;
  @Prop({ type: String })
  email!: string;
}

export abstract class AuditableSchema extends Document {
  @Prop({ required: false, type: String, default: null })
  createdBy!: string;

  @Prop({ required: false, type: ActivityUser, default: null })
  createdByInfo!: ActivityUser;

  @Prop({ required: false, type: String, default: null })
  updatedBy!: string;

  @Prop({ required: false, type: Date, default: null })
  deletedAt!: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;
}

export abstract class AggregateRoot extends AuditableSchema {
  @Prop({
    default: () => randomUUID(),
    required: true,
    type: mongoose.Schema.Types.UUID,
  })
  override _id!: string;
}

export abstract class SchemaIdentifier extends Document {
  @Prop({
    default: () => randomUUID(),
    required: true,
    type: mongoose.Schema.Types.UUID,
  })
  override _id!: string;
}
