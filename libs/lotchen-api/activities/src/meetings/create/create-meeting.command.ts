import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ActivitiesProvider } from '../../activities.provider';

export class CreateMeetingCommand {
  @ApiProperty({ description: 'Meeting owner id' })
  @IsNotEmpty()
  ownerId!: string;

  @ApiProperty({ description: 'Entity id on which the meeting is related' })
  @IsNotEmpty()
  relatedToId!: string;

  @ApiProperty({ description: 'Meeting title' })
  @IsNotEmpty()
  title!: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Meeting starting date ',
    type: Date,
    example: '2024-10-01',
  })
  startAtDate!: Date;

  @ApiProperty({
    description: 'Meeting starting time',
    type: String,
    example: '10:00',
  })
  @IsNotEmpty()
  startAtTime!: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Meeting end date ',
    type: Date,
    example: '2024-10-02',
  })
  endAtDate!: Date;

  @ApiProperty({
    description: 'Meeting end time',
    type: String,
    example: '11:00',
  })
  @IsNotEmpty()
  endAtTime!: string;

  @ApiProperty({
    description: 'Meeting is for the all day, 8h - 17h',
    type: Boolean,
  })
  allDay!: boolean;

  @ApiProperty({ description: 'Meeting location', type: String })
  location!: string;

  @ApiProperty({ description: 'Meeting description' })
  description!: string;

  @ApiProperty({ description: 'List of meeting attendees' })
  attendees!: string[];

  @ApiProperty({
    description: 'Meeting timezone',
    example: 'Africa/Abidjan +00:00 GMT',
    default: 'Europe/London +00:00 GMT',
  })
  meetingTimeZone!: string;
}

@Injectable()
export class CreateMeetingCommandHandler
  implements CommandHandler<CreateMeetingCommand, void>
{
  private readonly _logger = new Logger(CreateMeetingCommandHandler.name);
  public constructor(
    private readonly _activivitiesProvider: ActivitiesProvider
  ) {}

  public async handlerAsync(command: CreateMeetingCommand): Promise<void> {
    try {
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
        createdBy: this._activivitiesProvider.user()?.userId,
        createdByInfo: this._activivitiesProvider.user(),
        attendees: command.attendees, // list of user ids
        ownerId: command.ownerId,
        relatedToId: command.relatedToId,
        relatedToType: 'Meeting',
        meetingTimeZone: command.meetingTimeZone,
      });

      const errors = meeting.validateSync();

      if (errors) {
        throw new BadRequestException(
          'Validation error',
          JSON.stringify(errors)
        );
      }

      await meeting.save();
    } catch (error) {
      this._logger.error('Error creating meeting', JSON.stringify(error));
      throw new BadRequestException('Error creating meeting');
    }
  }
}
