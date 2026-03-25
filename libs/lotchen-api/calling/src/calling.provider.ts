import { Inject, Injectable, Provider } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { REQUEST } from '@nestjs/core';
import {
  TelephonyConfig,
  TelephonyConfigDocument,
  TelephonyConfigSchema,
} from './telephony-config/telephony-config.schema';

export const TELEPHONY_CONFIG_MODEL = 'TELEPHONY_CONFIG_MODEL';

@Injectable()
export class CallingProvider extends CurrentUserProvider {
  constructor(
    @Inject(TELEPHONY_CONFIG_MODEL)
    public readonly TelephonyConfigModel: Model<TelephonyConfigDocument>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}

export const callingProviders: Provider[] = [
  {
    provide: TELEPHONY_CONFIG_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(
        TelephonyConfig.name,
        TelephonyConfigSchema
      );
    },
    inject: ['TENANT_CONNECTION'],
  },
  CallingProvider,
];
