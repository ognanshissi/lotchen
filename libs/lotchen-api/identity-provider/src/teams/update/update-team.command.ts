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

export class UpdateTeamCommandRequest {
  @ApiProperty({ description: 'Team new name', required: false, type: String })
  name!: string;

  @ApiProperty({
    description: 'Team description',
    required: false,
    type: String,
  })
  description!: string;
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
    @Inject(REQUEST) private readonly _request: RequestExtendedWithUser
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

    let updateSet: { [key: string]: any } = {};

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
    console.log(update);
  }
}
