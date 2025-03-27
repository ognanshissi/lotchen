import { Global, Module } from '@nestjs/common';
import { TenantConnectionProvider } from './tenant/tenant-connection.provider';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'node:process';
import { AuthGuard } from './guards/auth.guard';
import { currentOrganizationProvider } from './current-organization/current-organization.provider';
import { PermissionsGuard } from './guards/permissions.guard';
import { APP_GUARD } from '@nestjs/core';
import { TenantDatabaseService } from './tenant/tenant-database.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env['SECRET'],
      signOptions: {
        expiresIn: process.env['TOKEN_EXPIRES_IN'], // for default token expiration
      },
    }),
  ],
  providers: [
    TenantConnectionProvider,
    currentOrganizationProvider,
    TenantDatabaseService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [
    TenantConnectionProvider,
    currentOrganizationProvider,
    TenantDatabaseService,
  ],
})
export class CoreModule {}
