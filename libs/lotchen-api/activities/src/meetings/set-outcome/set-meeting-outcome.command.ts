import { CommandHandler } from '@lotchen/api/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ActivitiesProvider } from '../../activities.provider';

export class SetMeetingOutcomeCommand {
  id!: string;

  @ApiProperty({
    description: 'Outcome value',
    enum: ['completed', 'no-show', 'rescheduled', 'cancelled'],
  })
  @IsNotEmpty()
  outcome!: 'completed' | 'no-show' | 'rescheduled' | 'cancelled';

  @ApiProperty({ description: 'Outcome notes', required: false })
  @IsOptional()
  outcomeNotes?: string;
}

const OUTCOME_TO_STATUS: Record<string, string> = {
  completed: 'Completed',
  'no-show': 'NoShow',
  rescheduled: 'Rescheduled',
  cancelled: 'Cancelled',
};

@Injectable()
export class SetMeetingOutcomeCommandHandler
  implements CommandHandler<SetMeetingOutcomeCommand, void>
{
  private readonly _logger = new Logger(SetMeetingOutcomeCommandHandler.name);

  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(command: SetMeetingOutcomeCommand): Promise<void> {
    const meeting = await this._activitiesProvider.MeetingModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).exec();

    if (!meeting) {
      throw new NotFoundException(`Meeting with id ${command.id} not found`);
    }

    const status = OUTCOME_TO_STATUS[command.outcome] ?? 'Scheduled';

    await this._activitiesProvider.MeetingModel.findOneAndUpdate(
      { _id: command.id, deletedAt: null },
      {
        $set: {
          outcome: command.outcome,
          outcomeNotes: command.outcomeNotes ?? '',
          status,
          updatedBy: this._activitiesProvider.user()?.userId,
          updatedByInfo: this._activitiesProvider.user(),
        },
      }
    );
  }
}
