import { CreateTerritoryCommandHandler } from './create/create-territory.command';
import { FindAllTerritoriesQueryHandler } from './find-all/find-all-territories.query';
import { TerritoriesProvider } from './territories.provider';
import { FindTerritoryAgenciesQueryHandler } from './find-territory-agencies/find-territory-agencies.query';

export * from './create/create-territory.command';
export * from './find-all/find-all-territories.query';
export * from './find-territory-agencies/find-territory-agencies.query';
export const territoriesHandlers = [
  CreateTerritoryCommandHandler,
  FindAllTerritoriesQueryHandler,
  TerritoriesProvider,
  FindTerritoryAgenciesQueryHandler,
];
