import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Address, AddressSchema } from './address.schema';
import { PhoneNumber, PhoneNumberSchema } from './phone-number.schema';
import { SchemaIdentifier } from './auditable.schema';

@Schema({ timestamps: false, id: false, _id: false })
export class PhoneNumbers {
  @Prop({ type: PhoneNumberSchema })
  workNumber!: PhoneNumber;
  @Prop({ type: PhoneNumberSchema })
  homeNumber!: PhoneNumber;
  @Prop({ type: PhoneNumberSchema })
  mobileNumber!: PhoneNumber;
}

export const phoneNumbersSchema = SchemaFactory.createForClass(PhoneNumbers);

@Schema({ timestamps: true })
export class ContactInfo extends SchemaIdentifier {
  @Prop({ type: String, required: false })
  email!: string;
  @Prop({ type: phoneNumbersSchema })
  phoneNumbers!: PhoneNumbers;
  @Prop({ type: AddressSchema })
  address!: Address;
}

export const ContactInfoSchema = SchemaFactory.createForClass(ContactInfo);
