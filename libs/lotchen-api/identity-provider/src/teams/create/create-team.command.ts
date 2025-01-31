import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { TeamsProvider } from '../teams.provider';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Model } from 'mongoose';
import { User } from '../../users';

export class CreateTeamCommand {
  @ApiProperty({ type: String, description: 'Name of the team' })
  @IsNotEmpty({ message: "Le nom de l'équipe est obligatoire." })
  name!: string;

  @ApiProperty({ required: false })
  description!: string;

  @ApiProperty({ required: false })
  managerId!: string;

  @ApiProperty({
    description: 'User Ids to link into the team',
    required: false,
    default: [],
    type: [String],
  })
  memberIds!: string[];
}

export class CreateTeamCommandResponse {
  @ApiProperty()
  id!: string;
}

@Injectable()
export class CreateTeamCommandHandler
  implements CommandHandler<CreateTeamCommand, CreateTeamCommandResponse>
{
  constructor(
    private readonly _teamsProvider: TeamsProvider,
    @Inject('USER_MODEL') private readonly UserModel: Model<User>
  ) {}

  public async handlerAsync(
    command: CreateTeamCommand
  ): Promise<CreateTeamCommandResponse> {
    try {
      // check  the name already exist
      const existingTeam = await this._teamsProvider.TeamModel.findOne({
        name: command.name,
      })
        .lean()
        .exec();

      if (existingTeam) {
        throw new BadRequestException(
          'Team with the name already exist, try another one.'
        );
      }

      // Check manager information
      let managerId: string | null = null;
      if (command.managerId) {
        const manager = await this.UserModel.findOne(
          {
            _id: command.managerId,
            isActive: true,
            isLocked: false,
            isDeleted: false,
          },
          '_id'
        )
          .lean()
          .exec();

        if (!manager) {
          throw new BadRequestException('ManagerId is not a valid userId');
        }

        managerId = manager._id;
      }

      const createdTeam = new this._teamsProvider.TeamModel({
        name: command.name,
        description: command.description,
        manager: managerId,
      });

      const errors = createdTeam.validateSync();

      if (errors) {
        throw new BadRequestException(errors.message);
      }

      await createdTeam.save();
      return {
        id: createdTeam.id,
      } as CreateTeamCommandResponse;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
