import { Inject, Injectable, Provider } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { Form, FormSchema } from './form.schema';

export const FORM_MODEL = 'FORM_MODEL';

@Injectable()
export class FormsProvider extends CurrentUserProvider {
  constructor(
    @Inject(FORM_MODEL) public readonly FormModel: Model<Form>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}

export const formsProviders: Provider[] = [
  {
    provide: FORM_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Form.name, FormSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  FormsProvider,
];
