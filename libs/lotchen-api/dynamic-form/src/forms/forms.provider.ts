import { Inject, Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { Form, FormSchema } from './form.schema';

export const FORM_MODEL = 'FORM_MODEL';

@Injectable()
export class FormsProvider {
  constructor(@Inject(FORM_MODEL) public readonly FormModel: Model<Form>) {}
}

export const FormsProviders = [
  {
    provide: FORM_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Form.name, FormSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
];
