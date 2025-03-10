import { CommandHandler, RequestExtendedWithUser } from '@lotchen/api/core';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Request } from 'express';
import { TeamsProvider } from '../teams.provider';
import { REQUEST } from '@nestjs/core';
import { TerritoriesProvider } from '../../territories/territories.provider';
import { Team, TerritoryInfo } from '../team.schema';
import { Model } from 'mongoose';
import { Profile } from '../../profile';

export class UpdateTeamCommandRequest {
  @ApiProperty({ description: 'Team new name', required: false, type: String })
  name!: string;

  @ApiProperty({
    description: 'Team description',
    required: false,
    type: String,
  })
  description!: string;

  @ApiProperty({ description: 'Territory Id', type: String, required: false })
  territoryId!: string;

  @ApiProperty({ description: 'Manager Id', type: String, required: false })
  managerId!: string;
}

export class UpdateTeamCommand extends UpdateTeamCommandRequest {
  @ApiProperty({ description: 'Team Id', type: String, required: true })
  id!: string;
}

@Injectable()
export class UpdateTeamCommandHandler
  implements CommandHandler<UpdateTeamCommand, void>
{
  constructor(
    private readonly _teamsProvider: TeamsProvider,
    @Inject(REQUEST) private readonly _request: RequestExtendedWithUser,
    private readonly _territoriesProvider: TerritoriesProvider,
    @Inject('PROFILE_MODEL') private readonly _profileModel: Model<Profile>
  ) {}

  public async handlerAsync(
    command: UpdateTeamCommand,
    req?: Request
  ): Promise<void> {
    const existingTeam = await this._teamsProvider.TeamModel.findOne(
      { _id: command.id, deletedAt: null },
      'id name'
    )
      .lean()
      .exec();

    if (!existingTeam) {
      throw new NotFoundException('Team to delete not found!');
    }

    let updateSet: Partial<Team> = {};

    // Make sure the new name is unique
    if (command.name) {
      const nameExist = await this._teamsProvider.TeamModel.findOne(
        { name: command.name },
        'id name'
      )
        .lean()
        .exec();
      if (nameExist?.name != existingTeam.name) {
        throw new BadRequestException(
          `Team with name '${command.name}' already exist!`
        );
      }

      updateSet = { ...updateSet, name: command.name };
    }

    // territory update
    if (command.territoryId) {
      const territory = await this._territoriesProvider.TerritoryModel.findOne(
        { _id: command.territoryId },
        'id name'
      )
        .lean()
        .exec();
      if (!territory) {
        throw new BadRequestException('Territory not found!');
      }
      updateSet = {
        ...updateSet,
        territoryId: command.territoryId,
        territoryInfo: {
          id: territory._id,
          name: territory.name,
        } as TerritoryInfo,
      };
    }

    // manager update
    if (command.managerId) {
      const manager = await this._profileModel
        .findOne(
          { user: command.managerId },
          'id contactInfo firstName lastName'
        )
        .populate('user', 'email id')
        .lean()
        .exec();

      if (!manager) {
        throw new BadRequestException('Manager not found!');
      }
      updateSet = {
        ...updateSet,
        manager: manager.user._id,
        managerInfo: {
          userId: manager.user._id,
          email: manager.contactInfo.email,
          firstName: manager.firstName,
          lastName: manager.lastName,
        },
      };
    }

    // update description
    if (command.description)
      updateSet = { ...updateSet, description: command.description };

    // add updateBy and updatedByInfo in the set to update
    const { firstName, lastName, username, sub } = this._request.user;
    updateSet = {
      ...updateSet,
      updatedBy: sub,
      updatedByInfo: { userId: sub, firstName, lastName, email: username },
    };

    const update = await this._teamsProvider.TeamModel.findByIdAndUpdate(
      command.id,
      updateSet
    );
  }
}
