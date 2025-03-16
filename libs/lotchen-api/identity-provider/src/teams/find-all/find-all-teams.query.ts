import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { AuditUserInfoDto, QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { TeamsProvider } from '../teams.provider';
import { isBoolean } from 'class-validator';

export class FindAllTeamsQuery {
  @ApiProperty({
    description: 'Fields to return',
    required: false,
    type: String,
  })
  fields!: string;

  @ApiProperty({ description: 'Filter by name', required: false, type: String })
  name!: string;

  @ApiProperty({
    description: 'Filter by deleted',
    required: false,
    type: Boolean,
    default: false,
  })
  isDeleted!: boolean;
}

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

export class FindAllTeamsQueryResponse {
  @ApiProperty({ description: 'Team Id' })
  id!: string;

  @ApiProperty({ description: 'Team name' })
  name!: string;

  @ApiProperty({
    description: 'Team description',
    type: String,
    required: false,
  })
  description!: string;

  @ApiProperty({ type: () => FindAllTeamsQueryUserDto, required: false })
  managerInfo!: FindAllTeamsQueryUserDto | undefined;

  @ApiProperty({
    type: 'array',
    required: false,
    items: { $ref: getSchemaPath(FindAllTeamsQueryUserDto) },
  })
  members!: FindAllTeamsQueryUserDto[] | [] | undefined;

  @ApiProperty({ type: Date, description: 'Date of creation' })
  createdAt!: Date;

  @ApiProperty({
    type: () => AuditUserInfoDto,
    description: 'Created by user information',
  })
  createdByInfo!: AuditUserInfoDto | undefined;

  @ApiProperty({ type: Date, description: 'Date of last update' })
  updatedAt!: Date;
}

@Injectable()
export class FindAllTeamsQueryHandler
  implements QueryHandler<FindAllTeamsQuery, FindAllTeamsQueryResponse[]>
{
  constructor(private readonly _teamsProvider: TeamsProvider) {}

  public async handlerAsync(
    query: FindAllTeamsQuery
  ): Promise<FindAllTeamsQueryResponse[]> {
    // dynamic projection
    let projection =
      'id name description managerInfo createdAt updatedAt createdByInfo members';

    if (query.fields) projection = query.fields.split(',').join(' ');

    // Filter
    let queryFilter: { [key: string]: any } = { deletedAt: null };
    if (query.name) {
      queryFilter = { ...queryFilter, name: new RegExp(query.name, 'i') };
    }

    if (isBoolean(query.isDeleted)) {
      queryFilter = { ...queryFilter, deletedAt: { $ne: null } };
    }

    // Teams QueryBuilder
    const teamsQueryBuilder = this._teamsProvider.TeamModel.find(
      queryFilter,
      projection,
      {
        sort: { createdAt: -1 },
      }
    );

    // Populate members relation
    if (query.fields?.includes('members')) {
      teamsQueryBuilder.populate({
        path: 'members',
        select: 'id email',
        match: { deletedAt: null },
      });
    }

    const teams = await teamsQueryBuilder.exec();

    return teams.map((team) => {
      return {
        id: team.id,
        name: team.name,
        description: team.description,
        members: query.fields?.includes('members')
          ? [
              ...team.members.map((member) => ({
                id: member.id,
                email: member.email,
                firstName: '',
                lastName: '',
              })),
            ]
          : undefined,
        managerInfo:
          team.managerInfo?.userId && query.fields?.includes('managerInfo')
            ? {
                id: team.managerInfo?.userId || '',
                email: team.managerInfo?.email || '',
                firstName: team.managerInfo?.firstName || '',
                lastName: team.managerInfo?.lastName || '',
              }
            : undefined,
        createdAt: team.createdAt,
        createdByInfo:
          team.createdByInfo && query.fields?.includes('createdByInfo')
            ? {
                id: team.createdByInfo?.userId ?? '',
                email: team.createdByInfo?.email ?? '',
                firstName: team.createdByInfo?.firstName ?? '',
                lastName: team.createdByInfo?.lastName ?? '',
              }
            : undefined,
        updatedAt: team.updatedAt,
      } satisfies FindAllTeamsQueryResponse;
    });
  }
}
