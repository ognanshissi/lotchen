import { InternalServerErrorException, Provider } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

export const CURRENT_ORGANIZATION_ID = 'CURRENT_ORGANIZATION_ID';

export const currentOrganizationProvider: Provider = {
  provide: CURRENT_ORGANIZATION_ID,
  useFactory: async (req: Request & { organizationId: string }) => {
    if (!req.organizationId) {
      throw new InternalServerErrorException(
        'Make sur the current organization middleware is provided'
      );
    }

    return req.organizationId;
  },
  inject: [REQUEST],
};
