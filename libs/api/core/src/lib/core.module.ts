import { Global, Module } from '@nestjs/common';
import { TenantConnectionProvider } from './tenant/tenant-connection.provider';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'node:process';

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
  controllers: [],
  providers: [TenantConnectionProvider],
  exports: [TenantConnectionProvider],
})
export class CoreModule {}
