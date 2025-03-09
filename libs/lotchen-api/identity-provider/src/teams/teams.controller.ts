import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateTeamCommand,
  CreateTeamCommandHandler,
  CreateTeamCommandResponse,
} from './create/create-team.command';
import {
  FindAllTeamsQuery,
  FindAllTeamsQueryHandler,
  FindAllTeamsQueryResponse,
} from './find-all/find-all-teams.query';
import { DeleteTeamCommandHandler } from './delete/delete-team.command';
import {
  UpdateTeamCommand,
  UpdateTeamCommandHandler,
  UpdateTeamCommandRequest,
} from './update/update-team.command';

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
    private readonly _findAllTeamsQueryHandler: FindAllTeamsQueryHandler,
    private readonly _deleteTeamCommandHandler: DeleteTeamCommandHandler,
    private readonly _updateTeamCommandHandler: UpdateTeamCommandHandler
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
  public async findAllTeams(
    @Query() query: FindAllTeamsQuery
  ): Promise<FindAllTeamsQueryResponse[]> {
    return await this._findAllTeamsQueryHandler.handlerAsync(query);
  }

  @Delete(':id')
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  public async deleteTeam(@Param('id') teamId: string): Promise<void> {
    await this._deleteTeamCommandHandler.handlerAsync({ id: teamId });
  }

  @Put(':id')
  @ApiResponse({
    description: 'Update team',
    status: HttpStatus.NO_CONTENT,
  })
  public async updateTeam(
    @Param('id') id: string,
    @Body() requestBody: UpdateTeamCommandRequest
  ) {
    const command: UpdateTeamCommand = {
      id,
      ...requestBody,
    };
    return await this._updateTeamCommandHandler.handlerAsync(command);
  }
}
