import { Connection } from 'mongoose';
import { Provider } from '@nestjs/common';
import { CaptureConfig, CaptureConfigSchema } from './capture-config.schema';

export const CAPTURE_CONFIG_MODEL = 'CAPTURE_CONFIG_MODEL';

export const captureConfigProviders: Provider[] = [
  {
    provide: CAPTURE_CONFIG_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(CaptureConfig.name, CaptureConfigSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
];
