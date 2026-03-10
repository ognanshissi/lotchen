import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ActivitiesProvider } from '../../activities.provider';

export class CreateEventTypeCommand {
  @ApiProperty({ description: 'Event type name' })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Feather icon name', required: false })
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Hex color for calendar display',
    required: false,
  })
  @IsOptional()
  color?: string;

  @ApiProperty({ description: 'Default duration in minutes', required: false })
  @IsOptional()
  defaultDurationMinutes?: number;

  @ApiProperty({
    description: 'Required fields when scheduling',
    required: false,
  })
  @IsOptional()
  requiredFields?: string[];
}

@Injectable()
export class CreateEventTypeCommandHandler
  implements CommandHandler<CreateEventTypeCommand, void>
{
  private readonly _logger = new Logger(CreateEventTypeCommandHandler.name);

  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(command: CreateEventTypeCommand): Promise<void> {
    try {
      const eventType = new this._activitiesProvider.EventTypeModel({
        name: command.name,
        icon: command.icon ?? 'feather:calendar',
        color: command.color ?? '#6366f1',
        defaultDurationMinutes: command.defaultDurationMinutes ?? 30,
        requiredFields: command.requiredFields ?? [],
        createdBy: this._activitiesProvider.user()?.userId,
        createdByInfo: this._activitiesProvider.user(),
      });

      const errors = eventType.validateSync();
      if (errors) {
        throw new BadRequestException(
          'Validation error',
          JSON.stringify(errors)
        );
      }

      await eventType.save();
    } catch (error) {
      this._logger.error('Error creating event type', JSON.stringify(error));
      throw new BadRequestException('Error creating event type');
    }
  }
}
