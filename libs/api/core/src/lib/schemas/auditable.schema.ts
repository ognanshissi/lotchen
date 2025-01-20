import { Prop } from '@nestjs/mongoose';

import { randomUUID } from 'crypto';

export class AuditableSchema {
  @Prop({ required: true, type: String, default: 'system' })
  createdBy!: string; // profile_id

  @Prop({ required: true, type: String, default: 'system' })
  updatedBy!: string;

  @Prop({ required: true, type: Boolean, default: false })
  isDeleted!: boolean;
}

export abstract class AggregateRoot extends AuditableSchema {
  @Prop({ default: () => randomUUID(), required: true, type: 'UUID' })
  _id!: string;
}
