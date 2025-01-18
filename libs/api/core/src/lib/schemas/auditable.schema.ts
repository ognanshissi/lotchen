import { Prop } from '@nestjs/mongoose';
import { TenantSchema } from '../interfaces';

export class AuditableSchema {
  @Prop({ required: true, type: String, default: 'system' })
  createdBy!: string; // profile_id

  @Prop({ required: true, type: String, default: 'system' })
  updatedBy!: string;

  @Prop({ required: true, type: Boolean, default: false })
  isDeleted!: boolean;
}

export abstract class AggregateRoot
  extends AuditableSchema
  implements TenantSchema
{
  @Prop({ default: 'localhost', required: true, type: String })
  tenantId!: string;
}
