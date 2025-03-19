import { Connection, Model } from 'mongoose';
import { Contact, ContactDocument, ContactSchema } from './contact.schema';
import { Inject, Injectable, Provider } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { RequestExtendedWithUser } from '@lotchen/api/core';
import { CallLog, CallLogSchema } from './call-log.schema';

export const CONTACT_MODEL = 'CONTACT_MODEL';
export const CALL_LOG_MODEL = 'CALL_LOG_MODEL';

@Injectable()
export class ContactProvider {
  constructor(
    @Inject(CONTACT_MODEL)
    public readonly ContactModel: Model<ContactDocument>,
    @Inject(CALL_LOG_MODEL) public readonly CallLogModel: Model<CallLog>,
    @Inject(REQUEST) public readonly request: RequestExtendedWithUser
  ) {}

  public currentUserInfo(): {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  } {
    // Update audit fields
    const { firstName, lastName, sub, username } = this.request.user;

    const userInfo = {
      userId: sub,
      email: username,
      firstName,
      lastName,
    };

    return { ...userInfo };
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
