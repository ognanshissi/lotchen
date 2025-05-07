import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { ActivitiesProvider } from '../../activities.provider';
import { Injectable, NotFoundException } from '@nestjs/common';

export class CompleteTaskCommand {
  @ApiProperty({ description: 'Task id' })
  taskId!: string;
}

@Injectable()
export class CompleteTaskCommandHandler
  implements CommandHandler<CompleteTaskCommand, void>
{
  public constructor(
    private readonly _activitiesProvider: ActivitiesProvider
  ) {}

  public async handlerAsync(command: CompleteTaskCommand): Promise<void> {
    const query = { _id: command.taskId, markAsCompletedAt: null };
    const task = await this._activitiesProvider.TaskModel.findOne(
      query,
      'id markAsCompletedAt'
    )
      .lean()
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this._activitiesProvider.TaskModel.findOneAndUpdate(query, {
      $set: {
        markAsCompletedAt: new Date(),
      },
    });
  }
}
