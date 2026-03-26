import { QueryHandler } from '@lotchen/api/core';
import { Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ActivitiesProvider } from '../../activities.provider';

export class FindMeetingsByRangeQuery {
  @ApiProperty({ required: false }) @IsOptional() ownerId?: string;
  @ApiProperty() @IsNotEmpty() startDate!: string;
  @ApiProperty() @IsNotEmpty() endDate!: string;
}

export class FindMeetingsByRangeResponse {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() startAt!: any;
  @ApiProperty() endAt!: any;
  @ApiProperty() ownerId!: string;
  @ApiProperty() eventTypeId!: string;
  @ApiProperty() status!: string;
  @ApiProperty() location!: string;
  @ApiProperty() description!: string;
}

@Injectable()
export class FindMeetingsByRangeQueryHandler
  implements
    QueryHandler<FindMeetingsByRangeQuery, FindMeetingsByRangeResponse[]>
{
  private readonly _logger = new Logger(FindMeetingsByRangeQueryHandler.name);

  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(
    query: FindMeetingsByRangeQuery
  ): Promise<FindMeetingsByRangeResponse[]> {
    try {
      // TODO: Implement date range filtering logic based on startAt and endAt fields

      const filter: any = {
        deletedAt: null,
      };

      // 'startAt.date': {
      //     $gte: new Date(query.startDate),
      //     $lte: new Date(query.endDate),
      //   },
      if (query.ownerId) {
        filter.ownerId = query.ownerId;
      }

      console.log('Querying meetings with filter:', JSON.stringify(filter));

      const meetings = await this._activitiesProvider.MeetingModel.find(
        filter,
        '_id title startAt endAt ownerId eventTypeId status location description',
        { sort: { 'startAt.date': 1, 'startAt.time': 1 } }
      ).exec();

      return meetings.map((m) => ({
        id: m._id,
        title: m.title,
        startAt: m.startAt,
        endAt: m.endAt,
        ownerId: m.ownerId,
        eventTypeId: m.eventTypeId ?? '',
        status: m.status ?? 'Scheduled',
        location: m.location ?? '',
        description: m.description ?? '',
      }));
    } catch (error) {
      this._logger.error(
        'Error fetching meetings by range',
        JSON.stringify(error)
      );
      return [];
    }
  }
}
