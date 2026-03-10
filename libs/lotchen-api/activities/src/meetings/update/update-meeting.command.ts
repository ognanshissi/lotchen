import { CommandHandler } from '@lotchen/api/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ActivitiesProvider } from '../../activities.provider';

export class UpdateMeetingCommand {
  id!: string;

  @ApiProperty({ required: false }) @IsOptional() title?: string;
  @ApiProperty({ required: false }) @IsOptional() startAtDate?: Date;
  @ApiProperty({ required: false }) @IsOptional() startAtTime?: string;
  @ApiProperty({ required: false }) @IsOptional() endAtDate?: Date;
  @ApiProperty({ required: false }) @IsOptional() endAtTime?: string;
  @ApiProperty({ required: false }) @IsOptional() location?: string;
  @ApiProperty({ required: false }) @IsOptional() description?: string;
  @ApiProperty({ required: false }) @IsOptional() attendees?: string[];
  @ApiProperty({ required: false }) @IsOptional() eventTypeId?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  reminderMinutesBefore?: number;
  @ApiProperty({ required: false }) @IsOptional() meetingTimeZone?: string;
}

@Injectable()
export class UpdateMeetingCommandHandler
  implements CommandHandler<UpdateMeetingCommand, void>
{
  private readonly _logger = new Logger(UpdateMeetingCommandHandler.name);

  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(command: UpdateMeetingCommand): Promise<void> {
    const meeting = await this._activitiesProvider.MeetingModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).exec();

    if (!meeting) {
      throw new NotFoundException(`Meeting with id ${command.id} not found`);
    }

    const updateData: Record<string, any> = {
      updatedBy: this._activitiesProvider.user()?.userId,
      updatedByInfo: this._activitiesProvider.user(),
    };

    if (command.title !== undefined) updateData.title = command.title;
    if (command.location !== undefined) updateData.location = command.location;
    if (command.description !== undefined)
      updateData.description = command.description;
    if (command.attendees !== undefined)
      updateData.attendees = command.attendees;
    if (command.eventTypeId !== undefined)
      updateData.eventTypeId = command.eventTypeId;
    if (command.reminderMinutesBefore !== undefined)
      updateData.reminderMinutesBefore = command.reminderMinutesBefore;
    if (command.meetingTimeZone !== undefined)
      updateData.meetingTimeZone = command.meetingTimeZone;

    if (
      command.startAtDate !== undefined ||
      command.startAtTime !== undefined
    ) {
      updateData.startAt = {
        date: command.startAtDate ?? meeting.startAt.date,
        time: command.startAtTime ?? meeting.startAt.time,
      };
    }
    if (command.endAtDate !== undefined || command.endAtTime !== undefined) {
      updateData.endAt = {
        date: command.endAtDate ?? meeting.endAt.date,
        time: command.endAtTime ?? meeting.endAt.time,
      };
    }

    await this._activitiesProvider.MeetingModel.findOneAndUpdate(
      { _id: command.id, deletedAt: null },
      { $set: updateData }
    );
  }
}
