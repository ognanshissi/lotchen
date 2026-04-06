import { Module } from '@nestjs/common';
import { CoreModule } from '@lotchen/api/core';
import { clientsProviders, ClientsProvider } from './clients.provider';
import { ClientController, clientHandlers } from './client';

@Module({
  imports: [CoreModule],
  controllers: [ClientController],
  providers: [...clientsProviders, ...clientHandlers],
  exports: [ClientsProvider],
})
export class ClientsModule {}
