import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum FieldType {
  Section = 'section', // a block of fields
  Text = 'text',
  Dropdown = 'dropdown',
  Date = 'date',
  DateTime = 'datetime',
  Time = 'time',
  Checkbox = 'checkbox',
  Radio = 'radio',
  Textarea = 'textarea',
}

@Schema({ timestamps: false, id: false, _id: false })
export class FieldConfigurationOptions {
  @Prop({ type: Boolean })
  canChoicesBeCustomized!: boolean;

  @Prop({ type: Boolean })
  allowSortInFilter!: boolean;

  @Prop({ type: Boolean })
  showImport!: boolean;

  @Prop({ type: Boolean })
  allowFieldToBeAdded!: boolean;

  @Prop({ type: Boolean, default: false })
  canNotBeHidden!: boolean;

  @Prop({ type: Boolean, default: false })
  canRequiredBeChanged!: boolean;

  @Prop({ type: Boolean, default: false })
  canUniquenessBeChanged!: boolean;

  @Prop({ type: Boolean, default: false })
  canBeHiddenInForm!: boolean;

  @Prop({ type: Boolean, default: false })
  canEditableBeChanged!: boolean;

  @Prop({ type: Boolean, default: false })
  canLabelBeRenamed!: boolean;
}

@Schema({ timestamps: false })
export class Field {
  @Prop({ type: 'UUID', ref: 'Field', default: null })
  parentId!: string | null;

  @Prop({ type: String })
  name!: string;

  subTitle!: string;

  @Prop({ type: String })
  columnName!: string;

  @Prop({ type: String })
  label!: string;

  @Prop({ type: Boolean })
  quickAdd!: boolean;

  @Prop({ type: Boolean, default: true })
  required!: boolean;

  @Prop({ type: String, enum: FieldType, default: FieldType.Section })
  type!: string;

  @Prop({ type: Boolean })
  internal!: boolean;

  @Prop({ type: Boolean })
  visible!: boolean;

  @Prop({ type: Boolean })
  validatable!: boolean;

  @Prop({ type: Number, default: 0 })
  position!: number;

  @Prop({ type: Boolean })
  editable!: boolean;

  @Prop({ type: String })
  hint!: string;

  @Prop({ type: Boolean, default: false })
  custom!: boolean; // ether the field is added by user or predefined in the system config

  @Prop({ type: String })
  placeholder!: string;

  @Prop({ type: String })
  fieldClass!: string;

  @Prop({ type: Map, of: String })
  errors!: Record<string, string>;

  @Prop({ type: Boolean })
  allowClearingDefaultValue!: boolean;

  @Prop({ type: FieldConfigurationOptions })
  fieldConfigurationOptions!: FieldConfigurationOptions;

  // Dropdown, autocomplete custom fields
  @Prop({ type: String })
  link!: string;

  @Prop({ type: [String] })
  options!: string;

  // Date validation
  minDate!: 'now' | 'formula';

  maxDate!: 'now' | 'formula';
}

export const FieldSchema = SchemaFactory.createForClass(Field);
