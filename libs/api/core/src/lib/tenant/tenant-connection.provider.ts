import { InternalServerErrorException, Provider } from '@nestjs/common';
import { Connection } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Request } from 'express';

export const TenantConnectionProvider: Provider = {
  provide: 'TENANT_CONNECTION',
  useFactory: async (
    request: Request & { tenant_fqdn: string },
    connection: Connection
  ) => {
    if (!request.tenant_fqdn) {
      throw new InternalServerErrorException(
        'Make sur the tenant middleware is provided'
      );
    }
    return connection.useDb(`lotchen_${request.tenant_fqdn}`);
  },
  inject: [REQUEST, getConnectionToken()],
};
