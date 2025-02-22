import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateTerritoryCommand,
  CreateTerritoryCommandHandler,
  FindAllTerritoriesQueryHandler,
  FindAllTerritoriesQueryResponse,
} from './index';
import { Permissions, PermissionsAction } from '@lotchen/api/core';

@Controller({
  version: '1',
  path: 'territories',
})
@ApiHeader({
  name: 'x-tenant-fqdn',
  description: 'The Tenant Fqdn',
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
  @Permissions(
    PermissionsAction.territoryCreate,
    PermissionsAction.allRecordManage
  )
  async createTerritory(
    @Body() payload: CreateTerritoryCommand
  ): Promise<void> {
    return this._createTerritoryCommandHandler.handlerAsync(payload);
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: [FindAllTerritoriesQueryResponse],
  })
  async allTerritories(): Promise<FindAllTerritoriesQueryResponse[]> {
    return await this._findAllTerritoriesQueryHandler.handlerAsync();
  }

  // @Get('/:id/teams')
  // async territoryTeams(
  //   @Param('id') id: string
  // ): Promise<FindTerritoryAgenciesQueryResponse[]> {
  //   return await this._findTerritoryAgenciesQueryHandler.handlerAsync({ id });
  // }
}
