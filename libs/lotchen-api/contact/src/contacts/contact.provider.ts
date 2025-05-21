import { Connection, Model } from 'mongoose';
import { Contact, ContactDocument, ContactSchema } from './contact.schema';
import { Inject, Injectable, Provider } from '@nestjs/common';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { CallLog, CallLogSchema } from './call-log.schema';
import { REQUEST } from '@nestjs/core';

export const CONTACT_MODEL = 'CONTACT_MODEL';
export const CALL_LOG_MODEL = 'CALL_LOG_MODEL';

@Injectable()
export class ContactProvider extends CurrentUserProvider {
  constructor(
    @Inject(CONTACT_MODEL)
    public readonly ContactModel: Model<ContactDocument>,
    @Inject(CALL_LOG_MODEL) public readonly CallLogModel: Model<CallLog>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}

export const contactProviders: Provider[] = [
  {
    provide: CONTACT_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Contact.name, ContactSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: CALL_LOG_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(CallLog.name, CallLogSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  ContactProvider,
];
