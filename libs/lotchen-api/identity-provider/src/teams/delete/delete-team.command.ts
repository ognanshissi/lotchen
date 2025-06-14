import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { TeamsProvider } from '../teams.provider';
import { Injectable, NotFoundException } from '@nestjs/common';

export class DeleteTeamCommand {
  @ApiProperty({ description: 'Team id to delete' })
  public id!: string;
}

@Injectable()
export class DeleteTeamCommandHandler
  implements CommandHandler<DeleteTeamCommand, void>
{
  constructor(private readonly _teamsProvider: TeamsProvider) {}

  public async handlerAsync(command: DeleteTeamCommand): Promise<void> {
    const team = await this._teamsProvider.TeamModel.findOne(
      { _id: command.id, deletedAt: null },
      'id'
    )
      .lean()
      .exec();

    if (!team) {
      throw new NotFoundException('Team not found! ');
    }

    // soft delete
    await this._teamsProvider.TeamModel.findOneAndUpdate(
      { _id: command.id },
      { deletedAt: new Date() }
    );
  }
}
