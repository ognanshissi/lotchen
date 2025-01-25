import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: false })
export class Point {
  @Prop({ type: String, enum: ['Point'], required: true })
  type!: string;

  @Prop({ type: [Number], required: String })
  coordinates!: [number];
}

export const PointSchema = SchemaFactory;
