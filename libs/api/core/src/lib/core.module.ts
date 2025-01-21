import { Global, Module } from '@nestjs/common';
import { TenantConnectionProvider } from './tenant/tenant-connection.provider';

@Global()
@Module({
  controllers: [],
  providers: [TenantConnectionProvider],
  exports: [TenantConnectionProvider],
})
export class CoreModule {}
