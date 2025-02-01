import {
  CommandHandler,
  filterQueryGenerator,
  Pagination,
  PaginationRequest,
} from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
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
    type: () => PaginateAllUsersTeamDto,
  })
  team!: PaginateAllUsersTeamDto | null;
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
    const queryFilter = filterQueryGenerator(command.filters);

    const totalDocuments = await this.UserModel.countDocuments(queryFilter)
      .lean()
      .exec();
    const totalPages = Math.ceil(totalDocuments / command.pageSize);

    const results = await this.UserModel.aggregate([
      { $match: queryFilter },
      { $skip: Math.max(command.pageIndex * command.pageSize, 0) },
      { $limit: Math.min(command.pageSize, totalDocuments) },
    ]).exec();

    const usersTeam: { [key: string]: any } = {};

    // const teams = await this.TeamModel.aggregate([
    //   { $project: { name: 1, id: 1, manager: 1, members: 1 } },
    //   {
    //     $match: {
    //       manager: {
    //         $in: results.map((item) => item.id),
    //       },
    //     },
    //   },
    // ]);

    return {
      pageIndex: command.pageIndex,
      pageSize: command.pageSize,
      totalElements: totalDocuments,
      data: [
        ...results.map((item) => {
          return {
            email: item.email,
            id: item._id,
            isVerified: item.isVerified,
            isActive: item.isActive,
            roles: [],
            permissions: item.permissions,
            team: {
              id: usersTeam[item._id]?._id,
              name: usersTeam[item._id]?.name,
            },
          } satisfies PaginateAllUsersCommandDto;
        }),
      ],
      totalPages: totalPages,
    } satisfies PaginateAllUsersCommandResponse;
  }
}
