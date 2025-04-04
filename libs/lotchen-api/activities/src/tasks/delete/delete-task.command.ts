import { CommandHandler } from '@lotchen/api/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ActivitiesProvider } from '../../activities.provider';

export class DeleteTaskCommand {
  taskId!: string;
}

@Injectable()
export class DeleteTaskCommandHandler
  implements CommandHandler<DeleteTaskCommand, void>
{
  private readonly _logger = new Logger(DeleteTaskCommandHandler.name);
  public constructor(
    private readonly _activitiesProvider: ActivitiesProvider
  ) {}
  public async handlerAsync(command: DeleteTaskCommand): Promise<void> {
    const query = {
      _id: command.taskId,
      deletedAt: { $ne: null },
    };
    const task = await this._activitiesProvider.TaskModel.findOne(
      query,
      'id title'
    )
      .lean()
      .exec();

    if (!task) {
      this._logger.error(`Task with id ${command.taskId} is not found.`);
      throw new NotFoundException(
        `Task with id ${command.taskId} is not found.`
      );
    }

    await this._activitiesProvider.TaskModel.findOneAndUpdate(query, {
      $set: {
        deletedAt: new Date(),
      },
    });
  }
}
