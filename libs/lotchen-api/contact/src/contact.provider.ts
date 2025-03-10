import { Connection, Model } from 'mongoose';
import { Contact, ContactDocument, ContactSchema } from './contact.schema';
import { Inject, Injectable, Provider } from '@nestjs/common';

export const CONTACT_MODEL = 'CONTACT_MODEL';

@Injectable()
export class ContactProvider {
  constructor(
    @Inject(CONTACT_MODEL)
    public readonly ContactModel: Model<ContactDocument>
  ) {}
}
export const contactProviders: Provider[] = [
  {
    provide: CONTACT_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Contact.name, ContactSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  ContactProvider,
];
