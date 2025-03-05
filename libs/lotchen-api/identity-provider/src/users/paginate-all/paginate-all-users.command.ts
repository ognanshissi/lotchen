import {
  CommandHandler,
  Pagination,
  PaginationRequest,
} from '@lotchen/api/core';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../user.schema';
import { Model } from 'mongoose';
import { Team } from '../../teams';

export class PaginateAllUsersCommand extends PaginationRequest {}

export class PaginateAllUsersTeamDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

@ApiExtraModels(PaginateAllUsersTeamDto)
export class PaginateAllUsersCommandDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ type: Boolean })
  isVerified!: boolean;

  @ApiProperty({ type: Boolean })
  isActive!: boolean;

  @ApiProperty({ type: [String] })
  roles!: string[];

  @ApiProperty({ type: [String] })
  permissions!: string[];

  @ApiProperty({
    type: 'array',
    items: { $ref: getSchemaPath(PaginateAllUsersTeamDto) },
  })
  teams!: PaginateAllUsersTeamDto[];

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginateAllUsersCommandResponse extends Pagination<PaginateAllUsersCommandDto> {}

@Injectable()
export class PaginateAllUsersCommandHandler
  implements
    CommandHandler<PaginateAllUsersCommand, PaginateAllUsersCommandResponse>
{
  public constructor(
    @Inject('USER_MODEL') private readonly UserModel: Model<User>,
    @Inject('TEAM_MODEL') private readonly TeamModel: Model<Team>
  ) {}

  public async handlerAsync(
    command: PaginateAllUsersCommand
  ): Promise<PaginateAllUsersCommandResponse> {
    const queryFilter = {};

    const totalDocuments = await this.UserModel.countDocuments(queryFilter)
      .lean()
      .exec();
    const totalPages = Math.ceil(totalDocuments / command.pageSize);

    const results = await this.UserModel.aggregate([
      { $match: queryFilter },
      { $skip: Math.max(command.pageIndex * command.pageSize, 0) },
      { $limit: Math.min(command.pageSize, totalDocuments) },
    ]).exec();

    const userIds = results.map((item) => item._id);

    const teams = await this.TeamModel.aggregate([
      { $project: { name: 1, id: 1, manager: 1, members: 1 } },
      {
        $match: {
          $or: [
            {
              manager: {
                $in: userIds,
              },
            },
            {
              members: {
                $in: userIds,
              },
            },
          ],
        },
      },
    ]);

    return {
      pageIndex: command.pageIndex,
      pageSize: command.pageSize,
      totalElements: totalDocuments,
      data: [
        ...results.map((item) => {
          return {
            id: item._id,
            email: item.email,
            isVerified: item.isVerified,
            isActive: item.isActive,
            roles: item.roles,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            permissions: item.permissions,
            teams: [],
          } satisfies PaginateAllUsersCommandDto;
        }),
      ],
      totalPages: totalPages,
    } satisfies PaginateAllUsersCommandResponse;
  }
}
