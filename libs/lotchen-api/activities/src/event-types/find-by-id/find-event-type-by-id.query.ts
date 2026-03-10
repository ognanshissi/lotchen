import { QueryHandler } from '@lotchen/api/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ActivitiesProvider } from '../../activities.provider';

export class FindEventTypeByIdQuery {
  @ApiProperty({ description: 'Event type ID' })
  id!: string;
}

export class FindEventTypeByIdQueryResponse {
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
export class FindEventTypeByIdQueryHandler
  implements
    QueryHandler<FindEventTypeByIdQuery, FindEventTypeByIdQueryResponse>
{
  private readonly _logger = new Logger(FindEventTypeByIdQueryHandler.name);

  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(
    query: FindEventTypeByIdQuery
  ): Promise<FindEventTypeByIdQueryResponse> {
    const eventType = await this._activitiesProvider.EventTypeModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).exec();

    if (!eventType) {
      throw new NotFoundException(`Event type with id ${query.id} not found`);
    }

    return {
      id: eventType._id,
      name: eventType.name,
      icon: eventType.icon,
      color: eventType.color,
      defaultDurationMinutes: eventType.defaultDurationMinutes,
      requiredFields: eventType.requiredFields,
      isSystem: eventType.isSystem,
      isActive: eventType.isActive,
    };
  }
}
