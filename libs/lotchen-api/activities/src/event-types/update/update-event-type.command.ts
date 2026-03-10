import { CommandHandler } from '@lotchen/api/core';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ActivitiesProvider } from '../../activities.provider';

export class UpdateEventTypeCommand {
  id!: string;

  @ApiProperty({ description: 'Event type name', required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Feather icon name', required: false })
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'Hex color', required: false })
  @IsOptional()
  color?: string;

  @ApiProperty({ description: 'Default duration in minutes', required: false })
  @IsOptional()
  defaultDurationMinutes?: number;

  @ApiProperty({ description: 'Required fields', required: false })
  @IsOptional()
  requiredFields?: string[];

  @ApiProperty({ description: 'Active status', required: false })
  @IsOptional()
  isActive?: boolean;
}

@Injectable()
export class UpdateEventTypeCommandHandler
  implements CommandHandler<UpdateEventTypeCommand, void>
{
  private readonly _logger = new Logger(UpdateEventTypeCommandHandler.name);

  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(command: UpdateEventTypeCommand): Promise<void> {
    const eventType = await this._activitiesProvider.EventTypeModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).exec();

    if (!eventType) {
      throw new NotFoundException(`Event type with id ${command.id} not found`);
    }

    const updateData: Record<string, any> = {
      updatedBy: this._activitiesProvider.user()?.userId,
      updatedByInfo: this._activitiesProvider.user(),
    };

    if (command.name !== undefined) updateData.name = command.name;
    if (command.icon !== undefined) updateData.icon = command.icon;
    if (command.color !== undefined) updateData.color = command.color;
    if (command.defaultDurationMinutes !== undefined)
      updateData.defaultDurationMinutes = command.defaultDurationMinutes;
    if (command.requiredFields !== undefined)
      updateData.requiredFields = command.requiredFields;
    if (command.isActive !== undefined) updateData.isActive = command.isActive;

    await this._activitiesProvider.EventTypeModel.findOneAndUpdate(
      { _id: command.id, deletedAt: null },
      { $set: updateData }
    );
  }
}
