import { InternalServerErrorException, Provider } from '@nestjs/common';
import { Connection } from 'mongoose';
import { REQUEST } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Request } from 'express';

export const TenantConnectionProvider: Provider = {
  provide: 'TENANT_CONNECTION',
  useFactory: async (
    request: Request & { tenant_fqn: string },
    connection: Connection
  ) => {
    if (!request.tenant_fqn) {
      throw new InternalServerErrorException(
        'Make sur the tenant middleware is provided'
      );
    }
    return connection.useDb(`lotchen_${request.tenant_fqn}`);
  },
  inject: [REQUEST, getConnectionToken()],
};
