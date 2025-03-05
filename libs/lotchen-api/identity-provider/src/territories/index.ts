import { CreateTerritoryCommandHandler } from './create/create-territory.command';
import { TerritoriesProvider } from './territories.provider';
import { FindTerritoryAgenciesQueryHandler } from './find-territory-agencies/find-territory-agencies.query';
import { PaginateAllTerritoriesCommandHandler } from './paginate-all/paginate-all-territories.command';
import { FindAllTerritoriesQueryHandler } from './find-all/find-all-territories.query-handler';

export * from './create/create-territory.command';
export * from './find-all/find-all-territories.query';
export * from './find-territory-agencies/find-territory-agencies.query';
export * from './find-all/find-all-territories.query-handler';
export const territoriesHandlers = [
  CreateTerritoryCommandHandler,
  FindAllTerritoriesQueryHandler,
  TerritoriesProvider,
  FindTerritoryAgenciesQueryHandler,
  PaginateAllTerritoriesCommandHandler,
];
