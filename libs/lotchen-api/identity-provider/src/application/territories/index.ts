import { CreateTerritoryCommandHandler } from './create/create-territory.command';
import { FindAllTerritoriesQueryHandler } from './find-all/find-all-territories.query';
import { TerritoriesProvider } from './territories.provider';

export * from './create/create-territory.command';
export * from './find-all/find-all-territories.query';

export const territoriesHandlers = [
  CreateTerritoryCommandHandler,
  FindAllTerritoriesQueryHandler,
  TerritoriesProvider,
];
