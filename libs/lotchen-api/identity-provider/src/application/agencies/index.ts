import { AgenciesProvider } from './agencies.provider';
import { CreateAgencyCommandHandler } from './create/create-agency.command';

export * from './create/create-agency.command';
export const agenciesHandlers = [AgenciesProvider, CreateAgencyCommandHandler];
