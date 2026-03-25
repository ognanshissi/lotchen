import { Module } from '@nestjs/common';
import { CoreModule } from '@lotchen/api/core';
import { callingProviders } from './calling.provider';
import {
  TelephonyConfigController,
  telephonyConfigHandlers,
} from './telephony-config';
import {
  CallerTokenController,
  GenerateCallerTokenCommandHandler,
} from './token';

@Module({
  imports: [CoreModule],
  controllers: [TelephonyConfigController, CallerTokenController],
  providers: [
    ...callingProviders,
    ...telephonyConfigHandlers,
    GenerateCallerTokenCommandHandler,
  ],
})
export class CallingModule {}
