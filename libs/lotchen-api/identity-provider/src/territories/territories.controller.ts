import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateTerritoryCommand,
  CreateTerritoryCommandHandler,
  FindAllTerritoriesQueryHandler,
  FindAllTerritoriesQueryResponse,
} from './index';

@Controller({
  version: '1',
  path: 'territories',
})
@ApiHeader({
  name: 'x-tenant-fqn',
  description: 'The Tenant Fqn',
})
@ApiTags('Territories')
export class TerritoriesController {
  constructor(
    private readonly _createTerritoryCommandHandler: CreateTerritoryCommandHandler,
    private readonly _findAllTerritoriesQueryHandler: FindAllTerritoriesQueryHandler
  ) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post()
  async createTerritory(
    @Body() payload: CreateTerritoryCommand
  ): Promise<void> {
    return this._createTerritoryCommandHandler.handlerAsync(payload);
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: FindAllTerritoriesQueryResponse,
  })
  async allTerritories(): Promise<FindAllTerritoriesQueryResponse[]> {
    return await this._findAllTerritoriesQueryHandler.handlerAsync();
  }

  // @Get('/:id/agencies')
  // async territoryAgencies(
  //   @Param('id') id: string
  // ): Promise<FindTerritoryAgenciesQueryResponse[]> {
  //   return await this._findTerritoryAgenciesQueryHandler.handlerAsync({ id });
  // }
}
