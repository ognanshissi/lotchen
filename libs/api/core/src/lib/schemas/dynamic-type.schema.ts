import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export interface DynamicSchemaType {
  customFields: Record<string, any>;
}

@Schema({ timestamps: false, _id: false, id: false, versionKey: false })
export class DynamicField implements DynamicSchemaType {
  @Prop({ type: Object, required: true })
  customFields!: Record<string, any>;
}

export const DynamicFieldSchema = SchemaFactory.createForClass(DynamicField);
