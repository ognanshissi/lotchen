import { Address } from './address';
import { PhoneNumbers } from './phone-numbers';

export class ContactInfo {
  email!: string;
  phoneNumbers!: PhoneNumbers;
  address!: Address;
}
