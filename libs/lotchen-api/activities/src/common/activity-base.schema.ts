import { AggregateRoot } from '@lotchen/api/core';
import { Prop } from '@nestjs/mongoose';

export class ActivityBase extends AggregateRoot {
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
}
