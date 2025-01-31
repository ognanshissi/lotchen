import { AgenciesProvider } from './agencies.provider';
import { CreateAgencyCommandHandler } from './create/create-agency.command';
import { FindAgencyByIdQueryHandler } from './find-by-id/find-agency-by-id.query';
import { FindAllAgenciesQueryHandler } from './find-all/find-all-agencies.query';

export * from './create/create-agency.command';
export * from './find-all/find-all-agencies.query';
export * from './find-by-id/find-agency-by-id.query';
export * from './agencies.controller';
export const agenciesHandlers = [
  AgenciesProvider,
  CreateAgencyCommandHandler,
  FindAgencyByIdQueryHandler,
  FindAllAgenciesQueryHandler,
];
