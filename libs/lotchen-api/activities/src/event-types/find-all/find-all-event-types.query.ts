import { QueryHandler } from '@lotchen/api/core';
import { Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ActivitiesProvider } from '../../activities.provider';

export class FindAllEventTypesQueryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() icon!: string;
  @ApiProperty() color!: string;
  @ApiProperty() defaultDurationMinutes!: number;
  @ApiProperty() requiredFields!: string[];
  @ApiProperty() isSystem!: boolean;
  @ApiProperty() isActive!: boolean;
}

@Injectable()
export class FindAllEventTypesQueryHandler
  implements QueryHandler<void, Array<FindAllEventTypesQueryResponse>>
{
  private readonly _logger = new Logger(FindAllEventTypesQueryHandler.name);

  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(): Promise<FindAllEventTypesQueryResponse[]> {
    try {
      const eventTypes = await this._activitiesProvider.EventTypeModel.find(
        { isActive: true, deletedAt: null },
        '_id name icon color defaultDurationMinutes requiredFields isSystem isActive',
        { sort: { createdAt: -1 } }
      ).exec();

      return eventTypes.map((et) => ({
        id: et._id,
        name: et.name,
        icon: et.icon,
        color: et.color,
        defaultDurationMinutes: et.defaultDurationMinutes,
        requiredFields: et.requiredFields,
        isSystem: et.isSystem,
        isActive: et.isActive,
      }));
    } catch (error) {
      this._logger.error('Error fetching event types', JSON.stringify(error));
      return [];
    }
  }
}
