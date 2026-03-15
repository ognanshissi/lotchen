import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AggregateRoot } from '@lotchen/api/core';
import { DealOutcome } from '../common/pipeline.enums';

@Schema({ id: false, _id: false, versionKey: false, timestamps: false })
export class StageHistoryEntry {
  @Prop({ type: 'UUID', required: true })
  stageId!: string;

  @Prop({ type: String, required: true })
  stageName!: string;

  @Prop({ type: Date, required: true })
  enteredAt!: Date;

  @Prop({ type: Date })
  exitedAt?: Date;

  @Prop({ type: 'UUID' })
  movedByUserId?: string;
}

export type DealDocument = HydratedDocument<Deal>;

@Schema({ collection: 'deals', timestamps: true })
export class Deal extends AggregateRoot {
  @Prop({ required: true, type: String })
  title!: string;

  @Prop({ required: true, type: 'UUID' })
  pipelineId!: string;

  @Prop({ required: true, type: 'UUID' })
  stageId!: string;

  @Prop({ type: Number, default: 0 })
  amount!: number;

  @Prop({ type: String, default: 'XOF' })
  currency!: string;

  @Prop({ type: 'UUID' })
  contactId?: string;

  @Prop({ type: String })
  contactName?: string;

  @Prop({ type: 'UUID' })
  leadId?: string;

  @Prop({ type: 'UUID' })
  assignedTo?: string;

  @Prop({ type: String })
  assignedToName?: string;

  @Prop({ type: Date })
  expectedCloseDate?: Date;

  @Prop({ type: Number, default: 0 })
  order!: number;

  @Prop({
    required: true,
    enum: DealOutcome,
    default: DealOutcome.Open,
    type: String,
  })
  outcome!: string;

  @Prop({ type: Date })
  closedAt?: Date;

  @Prop({ type: String })
  lostReason?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: [StageHistoryEntry], default: [] })
  stageHistory!: StageHistoryEntry[];
}

export const DealSchema = SchemaFactory.createForClass(Deal);

DealSchema.index({ pipelineId: 1, stageId: 1 });
DealSchema.index({ pipelineId: 1, outcome: 1 });
DealSchema.index({ contactId: 1 });
