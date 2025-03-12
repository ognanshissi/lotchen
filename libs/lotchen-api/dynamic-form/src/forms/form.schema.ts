import { AggregateRoot } from '@lotchen/api/core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, FieldSchema } from './field.schema';

@Schema({ timestamps: true, collection: 'dynamic_form_forms' })
export class Form extends AggregateRoot {
  @Prop({ type: String, required: true, unique: true })
  formClass!: string;

  @Prop({ type: String })
  name!: string;

  @Prop({ type: Map, of: String })
  metadata!: Record<string, string>;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: [FieldSchema] })
  fields!: Field[];
}

export const FormSchema = SchemaFactory.createForClass(Form);
