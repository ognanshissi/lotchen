import { Prop } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';

export class AuditableSchema {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.UUID,
    default: randomUUID(),
  })
  uuid!: string;

  @Prop({ required: true, type: String, default: 'system' })
  createdBy!: string; // profile_id

  @Prop({ required: true, type: String, default: 'system' })
  updatedBy!: string; // profile_id

  @Prop({ required: true, type: Boolean, default: false })
  isDeleted!: boolean;
}

export abstract class AggregateRoot extends AuditableSchema {}
