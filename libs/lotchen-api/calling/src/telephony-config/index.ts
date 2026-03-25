import { UpsertTelephonyConfigCommandHandler } from './upsert/upsert-telephony-config.command';
import { FindTelephonyConfigQueryHandler } from './find/find-telephony-config.query';
import { UpdateTelephonyConfigCommandHandler } from './update/update-telephony-config.command';

export { TelephonyConfigController } from './telephony-config.controller';
export { UpsertTelephonyConfigCommandHandler } from './upsert/upsert-telephony-config.command';
export { FindTelephonyConfigQueryHandler } from './find/find-telephony-config.query';
export { UpdateTelephonyConfigCommandHandler } from './update/update-telephony-config.command';

export const telephonyConfigHandlers = [
  UpsertTelephonyConfigCommandHandler,
  FindTelephonyConfigQueryHandler,
  UpdateTelephonyConfigCommandHandler,
];
