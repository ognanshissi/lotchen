import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ActivitiesProvider } from '../../activities.provider';

export class CreateMeetingCommand {
  @ApiProperty({ description: 'Meeting title' })
  @IsNotEmpty()
  title!: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Meeting starting date ', type: Date })
  startAtDate!: Date;

  @ApiProperty({ description: 'Meeting starting time', type: String })
  @IsNotEmpty()
  startAtTime!: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Meeting end date ', type: Date })
  endAtDate!: Date;

  @ApiProperty({ description: 'Meeting end time', type: String })
  @IsNotEmpty()
  endAtTime!: string;

  @ApiProperty({ description: 'Meeting is for the all day', type: Boolean })
  allDay!: boolean;

  @ApiProperty({ description: 'Meeting location', type: String })
  location!: string;

  @ApiProperty({ description: 'Meeting description' })
  description!: string;
}

@Injectable()
export class CreateMeetingCommandHandler
  implements CommandHandler<CreateMeetingCommand, void>
{
  public constructor(
    private readonly _activivitiesProvider: ActivitiesProvider
  ) {}

  public async handlerAsync(command: CreateMeetingCommand): Promise<void> {
    const meeting = new this._activivitiesProvider.MeetingModel({
      title: command.title,
      startAt: {
        date: command.startAtDate,
        time: command.startAtTime,
      },
      endAt: {
        date: command.endAtDate,
        time: command.endAtTime,
      },
      location: command.location,
      description: command.description,
      createdBy: this._activivitiesProvider.currentUserInfo()?.userId,
      createdByInfo: this._activivitiesProvider.currentUserInfo(),
    });

    const errors = meeting.validateSync();

    if (errors) {
      throw new BadRequestException('Validation error', JSON.stringify(errors));
    }

    await meeting.save();
  }
}
