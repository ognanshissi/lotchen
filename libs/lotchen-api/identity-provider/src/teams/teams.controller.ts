import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateTeamCommand,
  CreateTeamCommandHandler,
  CreateTeamCommandResponse,
} from './create/create-team.command';
import {
  FindAllTeamsQueryHandler,
  FindAllTeamsQueryResponse,
} from './find-all/find-all-teams.query';

@Controller({
  version: '1',
  path: 'teams',
})
@ApiHeader({
  name: 'x-tenant-fqdn',
  description: 'The Tenant Fqdn',
})
@ApiTags('Teams')
export class TeamsController {
  constructor(
    private readonly _createTeamCommandHandler: CreateTeamCommandHandler,
    private readonly _findAllTeamsQueryHandler: FindAllTeamsQueryHandler
  ) {}

  @Post()
  @ApiResponse({
    type: CreateTeamCommandResponse,
  })
  async createTeam(
    @Body() payload: CreateTeamCommand
  ): Promise<CreateTeamCommandResponse> {
    return await this._createTeamCommandHandler.handlerAsync(payload);
  }

  @Get()
  @ApiResponse({
    type: [FindAllTeamsQueryResponse],
  })
  public async findAllTeams(): Promise<FindAllTeamsQueryResponse[]> {
    return await this._findAllTeamsQueryHandler.handlerAsync();
  }
}
