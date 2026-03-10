import { CommandHandler } from '@lotchen/api/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ActivitiesProvider } from '../../activities.provider';

export class DeleteMeetingCommand {
  meetingId!: string;
}

@Injectable()
export class DeleteMeetingCommandHandler
  implements CommandHandler<DeleteMeetingCommand, void>
{
  private readonly _logger = new Logger(DeleteMeetingCommandHandler.name);

  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(command: DeleteMeetingCommand): Promise<void> {
    const meeting = await this._activitiesProvider.MeetingModel.findOne({
      _id: command.meetingId,
      deletedAt: null,
    })
      .lean()
      .exec();

    if (!meeting) {
      throw new NotFoundException(
        `Meeting with id ${command.meetingId} not found`
      );
    }

    await this._activitiesProvider.MeetingModel.findOneAndUpdate(
      { _id: command.meetingId, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );
  }
}
