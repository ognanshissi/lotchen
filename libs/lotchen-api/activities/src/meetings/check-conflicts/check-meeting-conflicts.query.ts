import { QueryHandler } from '@lotchen/api/core';
import { Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ActivitiesProvider } from '../../activities.provider';

export class CheckMeetingConflictsQuery {
  @ApiProperty({ description: 'ID of the user who owns the meeting' })
  @IsNotEmpty()
  ownerId!: string;
  @ApiProperty({ description: 'Start date of the new meeting' })
  @IsNotEmpty()
  startDate!: string;
  @ApiProperty({ description: 'Start time of the new meeting' })
  @IsNotEmpty()
  startTime!: string;
  @ApiProperty({ description: 'End date of the new meeting' })
  @IsNotEmpty()
  endDate!: string;
  @ApiProperty({ description: 'End time of the new meeting' })
  @IsNotEmpty()
  endTime!: string;
  @ApiProperty({
    required: false,
    description: 'ID of the meeting to exclude from conflict checking',
  })
  @IsOptional()
  excludeMeetingId?: string;
}

export class ConflictingMeetingResponse {
  @ApiProperty({ description: 'ID of the conflicting meeting' }) id!: string;
  @ApiProperty({ description: 'Title of the conflicting meeting' })
  title!: string;
  @ApiProperty({
    description: 'Start date and time of the conflicting meeting',
  })
  startAt!: any;
  @ApiProperty({ description: 'End date and time of the conflicting meeting' })
  endAt!: any;
}

@Injectable()
export class CheckMeetingConflictsQueryHandler
  implements
    QueryHandler<CheckMeetingConflictsQuery, ConflictingMeetingResponse[]>
{
  private readonly _logger = new Logger(CheckMeetingConflictsQueryHandler.name);

  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(
    query: CheckMeetingConflictsQuery
  ): Promise<ConflictingMeetingResponse[]> {
    try {
      const filter: any = {
        ownerId: query.ownerId,
        deletedAt: null,
        status: { $nin: ['Cancelled'] },
      };

      if (query.excludeMeetingId) {
        filter._id = { $ne: query.excludeMeetingId };
      }

      const meetings = await this._activitiesProvider.MeetingModel.find(
        filter,
        '_id title startAt endAt'
      ).exec();

      const newStart = `${query.startDate}T${query.startTime}`;
      const newEnd = `${query.endDate}T${query.endTime}`;

      return meetings
        .filter((m) => {
          const mStart = `${m.startAt.date}T${m.startAt.time}`;
          const mEnd = `${m.endAt.date}T${m.endAt.time}`;
          return mStart < newEnd && mEnd > newStart;
        })
        .map((m) => ({
          id: m._id,
          title: m.title,
          startAt: m.startAt,
          endAt: m.endAt,
        }));
    } catch (error) {
      this._logger.error('Error checking conflicts', JSON.stringify(error));
      return [];
    }
  }
}
