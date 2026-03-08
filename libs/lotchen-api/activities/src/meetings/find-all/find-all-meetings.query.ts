import { QueryHandler } from '@lotchen/api/core';
import { Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ActivitiesProvider } from '../../activities.provider';

export class FindAllMeetingsQuery {
  @ApiProperty({
    description: 'Entry related to entity, for example contactId',
  })
  relatedToId!: string;
}

export class FindAllMeetingsQueryResponse {
  @ApiProperty({ description: 'Meeting ID' })
  id!: string;

  @ApiProperty({ description: 'Related to entity ID' })
  relatedToId!: string;

  @ApiProperty({ description: 'Meeting title' })
  title!: string;

  @ApiProperty({ description: 'Meeting description' })
  description!: string;

  @ApiProperty({ description: 'Meeting location' })
  location!: string;

  @ApiProperty({ description: 'Meeting start time' })
  startAt!: any;

  @ApiProperty({ description: 'Meeting end time' })
  endAt!: any;

  @ApiProperty({ type: Date, description: 'Created date' })
  createdAt!: Date;
}

@Injectable()
export class FindAllMeetingsQueryHandler
  implements
    QueryHandler<FindAllMeetingsQuery, Array<FindAllMeetingsQueryResponse>>
{
  private readonly _logger = new Logger(FindAllMeetingsQueryHandler.name);

  public constructor(
    private readonly _activitiesProvider: ActivitiesProvider
  ) {}

  public async handlerAsync(
    query?: FindAllMeetingsQuery | undefined
  ): Promise<FindAllMeetingsQueryResponse[]> {
    try {
      const queryFilter: any = {};
      if (query?.relatedToId) {
        queryFilter.relatedToId = query.relatedToId;
      }

      const projection =
        '_id relatedToId title description location startAt endAt createdAt';

      const meetings = await this._activitiesProvider.MeetingModel.find(
        queryFilter,
        projection,
        { sort: { createdAt: -1 }, limit: 100 }
      ).exec();

      return meetings.map((meeting) => ({
        id: meeting._id,
        relatedToId: meeting.relatedToId,
        title: meeting.title,
        description: meeting.description ?? '',
        location: meeting.location ?? '',
        startAt: meeting.startAt,
        endAt: meeting.endAt,
        createdAt: meeting.createdAt,
      }));
    } catch (error) {
      this._logger.error(
        'Error in FindAllMeetingsQueryHandler',
        JSON.stringify(error)
      );
      return [];
    }
  }
}
