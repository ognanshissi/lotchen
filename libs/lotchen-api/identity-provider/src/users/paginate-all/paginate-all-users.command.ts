import {
  CommandHandler,
  Pagination,
  PaginationRequest,
} from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../user.schema';
import { Model } from 'mongoose';
import { Team } from '../../teams';

export class PaginateAllUsersCommand extends PaginationRequest {}

export class PaginateAllUsersCommandDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: '',
      },
      name: {
        type: 'string',
        example: 'Team Alpha',
      },
    },
  })
  team!: Record<string, string> | null;
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
    const queryFilter = {
      isDeleted: false,
    };

    const totalDocuments = await this.UserModel.countDocuments(
      queryFilter
    ).exec();
    const totalPages = Math.ceil(totalDocuments / command.pageSize);

    const results = await this.UserModel.find(queryFilter, undefined, {
      sort: command.sort,
      skip: Math.max(command.pageIndex * command.pageSize, 0),
      limit: Math.min(command.pageSize, totalDocuments),
    })
      .lean()
      .exec();

    const usersTeam: { [key: string]: any } = {};

    for (const user of results) {
      const team = await this.TeamModel.findOne(
        {
          isDeleted: false,
          $or: [
            {
              members: {
                $in: [user._id],
              },
            },
            {
              manager: user._id,
            },
          ],
        },

        '_id id name'
      )
        .lean()
        .exec();
      if (team) {
        usersTeam[user._id] = team;
      } else {
        usersTeam[user._id] = null;
      }
    }

    return {
      pageIndex: command.pageIndex,
      pageSize: command.pageSize,
      totalElements: totalDocuments,
      data: [
        ...results.map((item) => {
          return {
            email: item.email,
            id: item._id,
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
