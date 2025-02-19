import { Prop } from '@nestjs/mongoose';

import { randomUUID } from 'crypto';

export abstract class AuditableSchema {
  @Prop({ required: true, type: String, default: 'system' })
  createdBy!: string; // profile_id

  @Prop({ required: true, type: String, default: 'system' })
  updatedBy!: string;

  @Prop({ required: true, type: Boolean, default: false })
  isDeleted!: boolean;

  @Prop({ type: Date })
  createdAt!: Date;

  @Prop({ type: Date, default: null })
  updatedAt!: Date;
}

export abstract class AggregateRoot extends AuditableSchema {
  @Prop({ default: () => randomUUID(), required: true, type: 'UUID' })
  _id!: string;
}

export abstract class SchemaIdentifier {
  @Prop({ default: () => randomUUID(), required: true, type: 'UUID' })
  _id!: string;
}
