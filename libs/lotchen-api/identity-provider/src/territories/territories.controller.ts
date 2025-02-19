import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateTerritoryCommand,
  CreateTerritoryCommandHandler,
  FindAllTerritoriesQueryHandler,
  FindAllTerritoriesQueryResponse,
} from './index';
import { CURRENT_ORGANIZATION_ID } from '../../../../api/core/src/lib/current-organization/current-organization.provider';

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
    @Inject(CURRENT_ORGANIZATION_ID) private readonly organizationId: string,
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
    type: [FindAllTerritoriesQueryResponse],
  })
  async allTerritories(): Promise<FindAllTerritoriesQueryResponse[]> {
    console.log(this.organizationId);
    return await this._findAllTerritoriesQueryHandler.handlerAsync();
  }

  // @Get('/:id/teams')
  // async territoryTeams(
  //   @Param('id') id: string
  // ): Promise<FindTerritoryAgenciesQueryResponse[]> {
  //   return await this._findTerritoryAgenciesQueryHandler.handlerAsync({ id });
  // }
}
