import { Prop } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Document } from 'mongoose';

export abstract class AuditableSchema extends Document {
  @Prop({ required: false, type: String, default: null })
  createdBy!: string;

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
  @Prop({ default: () => randomUUID(), required: true, type: 'UUID' })
  override _id!: string;
}

export abstract class SchemaIdentifier extends Document {
  @Prop({ default: () => randomUUID(), required: true, type: 'UUID' })
  override _id!: string;
}
