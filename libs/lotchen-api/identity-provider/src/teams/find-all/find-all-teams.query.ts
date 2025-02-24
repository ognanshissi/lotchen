import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
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

export class FindAllTeamsQueryAuthorAuditDto {}

export class FindAllTeamsQueryResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ type: () => FindAllTeamsQueryUserDto })
  manager!: FindAllTeamsQueryUserDto | null;

  @ApiProperty({
    type: 'array',
    items: { $ref: getSchemaPath(FindAllTeamsQueryUserDto) },
  })
  members!: FindAllTeamsQueryUserDto[] | [];

  @ApiProperty({ type: Date, description: 'Date of creation' })
  createdAt!: Date;

  @ApiProperty({
    type: () => FindAllTeamsQueryAuthorAuditDto,
    description: 'Created by user informations',
  })
  createdBy!: FindAllTeamsQueryAuthorAuditDto | null;

  @ApiProperty({ type: Date, description: 'Date of last update' })
  updatedAt!: Date;
}

@Injectable()
export class FindAllTeamsQueryHandler
  implements QueryHandler<FindAllTeamsQuery, FindAllTeamsQueryResponse[]>
{
  constructor(private readonly _teamsProvider: TeamsProvider) {}

  public async handlerAsync(): Promise<FindAllTeamsQueryResponse[]> {
    const teams = await this._teamsProvider.TeamModel.find(
      { isDeleted: false },
      'id name description memberInfo createdAt updatedAt createdByInfo'
    )
      .populate({
        path: 'members',
        select: 'id email',
        match: { isDeleted: false },
      })
      .exec();

    return teams.map((team) => {
      return {
        id: team.id,
        name: team.name,
        description: team.description,
        members: [],
        manager: team.managerInfo?.userId
          ? {
              id: team.managerInfo?.userId || '',
              email: team.managerInfo?.email || '',
              firstName: team.managerInfo?.firstName || '',
              lastName: team.managerInfo?.lastName || '',
            }
          : null,
        createdAt: team.createdAt,
        createdBy: team.createdByInfo?.userId
          ? {
              id: team.createdByInfo?.userId ?? '',
              email: team.createdByInfo?.email ?? '',
              firstName: team.createdByInfo?.firstName ?? '',
              lastName: team.createdByInfo?.lastName ?? '',
            }
          : null,
        updatedAt: team.updatedAt,
      } satisfies FindAllTeamsQueryResponse;
    });
  }
}
