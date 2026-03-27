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
    const tenant = request.tenant_fqdn ?? process.env['X_TENANT_FQDN'];
    return connection.useDb(`lotchen_${tenant}`);
  },
  inject: [REQUEST, getConnectionToken()],
};
