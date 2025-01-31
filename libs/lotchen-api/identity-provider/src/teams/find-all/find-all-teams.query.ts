import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { TeamsProvider } from '../teams.provider';

export class FindAllTeamsQuery {}

export class FindAllTeamsQueryUserDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  email!: string;
  @ApiProperty()
  firstName!: string;
  @ApiProperty()
  lastName!: string;
}

export class FindAllTeamsQueryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ type: () => FindAllTeamsQueryUserDto })
  manager!: FindAllTeamsQueryUserDto | null;

  @ApiProperty({ type: () => Array<FindAllTeamsQueryUserDto> })
  members!: FindAllTeamsQueryUserDto[] | [];
}

@Injectable()
export class FindAllTeamsQueryHandler
  implements QueryHandler<FindAllTeamsQuery, FindAllTeamsQueryResponse[]>
{
  constructor(private readonly _teamsProvider: TeamsProvider) {}

  public async handlerAsync(): Promise<FindAllTeamsQueryResponse[]> {
    const teams = await this._teamsProvider.TeamModel.find({ isDeleted: false })
      .populate({
        path: 'members',
        select: 'id email firstName lastName',
        match: { isDeleted: false },
      })
      .populate({
        path: 'manager',
        match: { isDeleted: false },
        select: 'id email firstName lastName',
      })
      .exec();

    return teams.map((team) => {
      return {
        id: team.id,
        name: team.name,
        description: team.description,
        members: [],
        manager: null,
      } satisfies FindAllTeamsQueryResponse;
    });
  }
}
