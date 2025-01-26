import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateAgencyCommand,
  CreateAgencyCommandHandler,
} from '../application/agencies';

@Controller({
  version: '1',
  path: 'agencies',
})
@ApiTags('Agencies')
export class AgenciesController {
  constructor(
    private readonly _createAgencyCommandHandler: CreateAgencyCommandHandler
  ) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  async createAgency(@Body() payload: CreateAgencyCommand): Promise<void> {
    return await this._createAgencyCommandHandler.handlerAsync(payload);
  }
}
