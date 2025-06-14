import {
  ActivityUser,
  CommandHandler,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { TeamsProvider } from '../teams.provider';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Model } from 'mongoose';
import { Profile } from '../../profile';
import { REQUEST } from '@nestjs/core';
import { TerritoriesProvider } from '../../territories/territories.provider';
import { UserDocument } from '../../users';

export class CreateTeamCommand {
  @ApiProperty({ type: String, description: 'Name of the team' })
  @IsNotEmpty({ message: 'The name is required' })
  name!: string;

  @ApiProperty({ required: false, description: 'Team description' })
  description!: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'The territory on  which the team is linked',
  })
  territoryId!: string;

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
  private readonly _logger = new Logger(CreateTeamCommandHandler.name);

  constructor(
    private readonly _teamsProvider: TeamsProvider,
    @Inject('PROFILE_MODEL')
    private readonly ProfileModel: Model<Profile>,
    @Inject('USER_MODEL') private readonly UserModel: Model<UserDocument>,
    private readonly territoriesProvider: TerritoriesProvider,
    @Inject(REQUEST) private readonly request: RequestExtendedWithUser
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

      let territory: { name: string; id: string } | null = null;
      if (command.territoryId) {
        const territoryExist =
          await this.territoriesProvider.TerritoryModel.findOne(
            { _id: command.territoryId },
            'id name'
          )
            .lean()
            .exec();

        this._logger.log(`Territory => ${JSON.stringify(territoryExist)}`);

        territory = {
          name: territoryExist?.name ?? '',
          id: territoryExist?._id.toString() ?? '',
        };
      }

      // Check manager information
      let managerInfo: ActivityUser | null = null;
      if (command.managerId) {
        // Get user information
        const userManagerInfo = await this.UserModel.findOne(
          { _id: command.managerId },
          '_id email'
        )
          .lean()
          .exec();

        this._logger.log('ManagerId => ' + JSON.stringify(userManagerInfo));

        if (!userManagerInfo) {
          throw new BadRequestException('ManagerId is not a valid userId');
        }

        this._logger.log('Load manager profile below => ' + command.managerId);
        // Load user profile information
        const managerProfile = await this.ProfileModel.findOne(
          {
            user: userManagerInfo?._id,
          },
          'id _id firstName lastName contactInfo user'
        ).exec();

        if (!managerProfile) {
          throw new BadRequestException('ManagerId is not a valid userId');
        }

        managerInfo = {
          firstName: managerProfile.firstName,
          lastName: managerProfile.lastName,
          email: managerProfile.contactInfo.email,
          userId: command.managerId, // userId
        };
      }

      // Members
      let membersIds: string[] = [];
      if (command.memberIds.length) {
        const teamMembers = await this.UserModel.find(
          {
            _id: { $in: command.memberIds },
          },
          'id'
        )
          .lean()
          .exec();

        membersIds = (teamMembers ?? [])?.map((member) => member._id);
      }

      const createdTeam = new this._teamsProvider.TeamModel({
        name: command.name,
        description: command.description,
        manager: managerInfo?.userId,
        managerInfo: managerInfo,
        members: membersIds, // users
        territory: territory ? territory.id : null,
        territoryInfo: territory ? territory : null,
        createdBy: this.request.user.sub,
        createdByInfo: {
          userId: this.request.user.sub,
          email: this.request.user.username,
          firstName: this.request.user.firstName,
          lastName: this.request.user.lastName,
        },
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
