import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaIdentifier } from './auditable.schema';
import { Point, PointSchema } from './point.schema';

@Schema({ timestamps: false })
export class Address extends SchemaIdentifier {
  @Prop({ type: String })
  public street!: string;

  @Prop({ type: String })
  public city!: string;

  @Prop({ type: String })
  public state!: string;

  @Prop({ type: String })
  public country!: string;

  @Prop({ type: Number })
  public postalCode!: string;

  @Prop({ type: PointSchema, required: false })
  public location!: Point;

  @Prop({ type: Boolean, default: false })
  public isDefaultAddress!: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
