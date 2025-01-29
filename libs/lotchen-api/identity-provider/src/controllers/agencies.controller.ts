import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateAgencyCommand,
  CreateAgencyCommandHandler,
  FindAgencyByIdQueryHandler,
  FindAgencyByIdQueryResponse,
  FindAllAgenciesQueryHandler,
  FindAllAgenciesQueryResponse,
} from '../application/agencies';

@Controller({
  version: '1',
  path: 'agencies',
})
@ApiHeader({
  name: 'x-tenant-fqn',
  description: 'The Tenant Fqn',
})
@ApiTags('Agencies')
export class AgenciesController {
  constructor(
    private readonly _createAgencyCommandHandler: CreateAgencyCommandHandler,
    private readonly _findAgencyByIdQueryHandler: FindAgencyByIdQueryHandler,
    private readonly _findAllAgenciesQueryHandler: FindAllAgenciesQueryHandler
  ) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  async createAgency(@Body() payload: CreateAgencyCommand): Promise<void> {
    return await this._createAgencyCommandHandler.handlerAsync(payload);
  }

  @Get()
  @ApiResponse({
    type: FindAllAgenciesQueryResponse,
  })
  async findAllAgencies(): Promise<FindAllAgenciesQueryResponse[]> {
    return await this._findAllAgenciesQueryHandler.handlerAsync();
  }

  @Get('/:id')
  async findAgencyById(
    @Param('id') id: string
  ): Promise<FindAgencyByIdQueryResponse> {
    return this._findAgencyByIdQueryHandler.handlerAsync({ id });
  }
}
