import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import { randomUUID } from 'crypto';

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class PipelineStage {
  @Prop({ type: 'UUID', default: () => randomUUID(), required: true })
  stageId!: string;

  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: Number })
  order!: number;

  @Prop({ type: String, default: '#6366f1' })
  color!: string;

  @Prop({ type: Number, default: 0 })
  winProbability!: number;

  @Prop({ type: [String], default: [] })
  requiredFields!: string[];

  @Prop({ type: Boolean, default: false })
  isWon!: boolean;

  @Prop({ type: Boolean, default: false })
  isLost!: boolean;
}

export type SalesPipelineDocument = HydratedDocument<SalesPipeline>;

@Schema({ collection: 'sales_pipelines', timestamps: true })
export class SalesPipeline extends AggregateRoot {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ type: String, default: '' })
  description!: string;

  @Prop({ type: [PipelineStage], default: [] })
  stages!: PipelineStage[];

  @Prop({ type: Boolean, default: false })
  isDefault!: boolean;

  @Prop({ type: String, default: 'XOF' })
  currency!: string;
}

export const SalesPipelineSchema = SchemaFactory.createForClass(SalesPipeline);

SalesPipelineSchema.index({ isDefault: 1 });
