import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateTerritoryCommand,
  CreateTerritoryCommandHandler,
  FindAllTerritoriesQuery,
  FindAllTerritoriesQueryHandler,
  FindAllTerritoriesQueryResponse,
} from './index';
import {
  ApiPaginationResponse,
  Permissions,
  PermissionsAction,
} from '@lotchen/api/core';
import {
  PaginateAllTerritoriesCommand,
  PaginateAllTerritoriesCommandHandler,
  PaginateAllTerritoriesCommandResponse,
} from './paginate-all/paginate-all-territories.command';

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
    private readonly _findAllTerritoriesQueryHandler: FindAllTerritoriesQueryHandler,
    private readonly _paginateAllTerritoriesCommandHandler: PaginateAllTerritoriesCommandHandler
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
  async allTerritories(
    @Query() query: FindAllTerritoriesQuery
  ): Promise<FindAllTerritoriesQueryResponse[]> {
    return await this._findAllTerritoriesQueryHandler.handlerAsync(query);
  }

  @Post('/paginate')
  @ApiPaginationResponse(PaginateAllTerritoriesCommandResponse)
  async paginateAllTerritories(
    @Body() command: PaginateAllTerritoriesCommand
  ): Promise<PaginateAllTerritoriesCommandResponse> {
    return await this._paginateAllTerritoriesCommandHandler.handlerAsync(
      command
    );
  }

  // @Get('/:id/teams')
  // async territoryTeams(
  //   @Param('id') id: string
  // ): Promise<FindTerritoryAgenciesQueryResponse[]> {
  //   return await this._findTerritoryAgenciesQueryHandler.handlerAsync({ id });
  // }
}
