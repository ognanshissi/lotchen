import { QueryHandler } from '@lotchen/api/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ActivitiesProvider } from '../../activities.provider';

export class FindMeetingByIdQuery {
  id!: string;
}

export class FindMeetingByIdQueryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty() location!: string;
  @ApiProperty() startAt!: any;
  @ApiProperty() endAt!: any;
  @ApiProperty() ownerId!: string;
  @ApiProperty() relatedToId!: string;
  @ApiProperty() relatedToType!: string;
  @ApiProperty() attendees!: string[];
  @ApiProperty() eventTypeId!: string;
  @ApiProperty() status!: string;
  @ApiProperty() outcome!: string;
  @ApiProperty() outcomeNotes!: string;
  @ApiProperty() followUpEventId!: string;
  @ApiProperty() reminderMinutesBefore!: number;
  @ApiProperty() meetingTimeZone!: string;
  @ApiProperty() createdAt!: Date;
}

@Injectable()
export class FindMeetingByIdQueryHandler
  implements QueryHandler<FindMeetingByIdQuery, FindMeetingByIdQueryResponse>
{
  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(
    query: FindMeetingByIdQuery
  ): Promise<FindMeetingByIdQueryResponse> {
    const meeting = await this._activitiesProvider.MeetingModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).exec();

    if (!meeting) {
      throw new NotFoundException(`Meeting with id ${query.id} not found`);
    }

    return {
      id: meeting._id,
      title: meeting.title,
      description: meeting.description ?? '',
      location: meeting.location ?? '',
      startAt: meeting.startAt,
      endAt: meeting.endAt,
      ownerId: meeting.ownerId,
      relatedToId: meeting.relatedToId,
      relatedToType: meeting.relatedToType,
      attendees: meeting.attendees ?? [],
      eventTypeId: meeting.eventTypeId,
      status: meeting.status ?? 'Scheduled',
      outcome: meeting.outcome ?? '',
      outcomeNotes: meeting.outcomeNotes ?? '',
      followUpEventId: meeting.followUpEventId,
      reminderMinutesBefore: meeting.reminderMinutesBefore,
      meetingTimeZone: meeting.meetingTimeZone,
      createdAt: meeting.createdAt,
    };
  }
}
