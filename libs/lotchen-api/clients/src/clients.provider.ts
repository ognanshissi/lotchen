import { Inject, Injectable, Provider } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { Client, ClientDocument, ClientSchema } from './client/client.schema';

export const CLIENT_MODEL = 'CLIENT_MODEL';

@Injectable()
export class ClientsProvider extends CurrentUserProvider {
  constructor(
    @Inject(CLIENT_MODEL) public readonly ClientModel: Model<ClientDocument>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}

export const clientsProviders: Provider[] = [
  {
    provide: CLIENT_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Client.name, ClientSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  ClientsProvider,
];
