import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { TeamsProvider } from '../teams.provider';

export class FindAllTeamsQuery {}

export class FindAllTeamsQueryUserDto {
  @ApiProperty({ description: 'User Id', type: String, required: false })
  id!: string;
  @ApiProperty({ description: 'User email', type: String, required: false })
  email!: string;
  @ApiProperty({ description: 'FirstName', type: String, required: false })
  firstName!: string;
  @ApiProperty({ description: 'LastName', type: String, required: false })
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
    type: () => FindAllTeamsQueryUserDto,
    description: 'Created by user information',
  })
  createdBy!: FindAllTeamsQueryUserDto | null;

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
      { isDeleted: null },
      'id name description managerInfo createdAt updatedAt createdByInfo manager members',
      {
        sort: { createdAt: -1 },
      }
    )
      .populate({
        path: 'members',
        select: 'id email',
        match: { isDeleted: false },
      })
      .populate({
        path: 'manager',
        select: 'id email',
      })
      .exec();

    return teams.map((team) => {
      return {
        id: team.id,
        name: team.name,
        description: team.description,
        members: [
          ...team.members.map((member) => ({
            id: member.id,
            email: member.email,
            firstName: '',
            lastName: '',
          })),
        ],
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
