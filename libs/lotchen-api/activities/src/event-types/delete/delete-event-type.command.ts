import { CommandHandler } from '@lotchen/api/core';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ActivitiesProvider } from '../../activities.provider';

export class DeleteEventTypeCommand {
  id!: string;
}

@Injectable()
export class DeleteEventTypeCommandHandler
  implements CommandHandler<DeleteEventTypeCommand, void>
{
  private readonly _logger = new Logger(DeleteEventTypeCommandHandler.name);

  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(command: DeleteEventTypeCommand): Promise<void> {
    const eventType = await this._activitiesProvider.EventTypeModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).exec();

    if (!eventType) {
      throw new NotFoundException(`Event type with id ${command.id} not found`);
    }

    if (eventType.isSystem) {
      throw new BadRequestException('Cannot delete a system event type');
    }

    await this._activitiesProvider.EventTypeModel.findOneAndUpdate(
      { _id: command.id },
      { $set: { deletedAt: new Date() } }
    );
  }
}
