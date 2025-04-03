import { QueryHandler } from '@lotchen/api/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { TaskTypeEnum } from '../task-type.enum';
import { TaskProvider } from '../task.provider';
import { IsUUID } from 'class-validator';

export class FindAllTasksQuery {
  @ApiProperty({ description: 'The user whom the task is assigned' })
  @IsUUID()
  ownerId!: string;

  @ApiProperty({
    description: 'Entry related to entity, for example contactId',
  })
  relatedToId!: string;

  @ApiProperty({
    description: 'Type of task',
    enum: TaskTypeEnum,
    default: TaskTypeEnum.FollowUp,
  })
  taskType!: string;

  @ApiProperty({ type: Boolean, description: 'Completed tasks' })
  completed!: boolean;
}

export class FindAllTasksQueryResponse {
  @ApiProperty({ description: 'Task ID' })
  id!: string;

  @ApiProperty({ description: 'tasks onwer id' })
  ownerId!: string;

  @ApiProperty({ description: 'Task type' })
  taskType!: string;

  @ApiProperty({ description: 'Task title' })
  title!: string;

  @ApiProperty({ description: 'Task description' })
  description!: string;

  @ApiProperty({ type: Date, description: 'Due Date' })
  dueDate!: Date;

  @ApiProperty({ type: String, description: 'Due Date time' })
  dueDatetime!: string;

  @ApiProperty({ type: Boolean, description: 'Marked task as completed' })
  markedAsCompleted!: boolean;
}

@Injectable()
export class FindAllTasksQueryHandler
  implements QueryHandler<FindAllTasksQuery, Array<FindAllTasksQueryResponse>>
{
  public constructor(private readonly _taskProvider: TaskProvider) {}

  public async handlerAsync(
    query?: FindAllTasksQuery | undefined
  ): Promise<FindAllTasksQueryResponse[]> {
    let queryFilter = {};

    if (query?.ownerId) {
      queryFilter = { ...queryFilter, ownerId: query.ownerId };
    }

    if (query?.relatedToId) {
      queryFilter = { ...queryFilter, relatedToId: query.relatedToId };
    }

    if (query?.taskType) {
      queryFilter = { ...queryFilter, taskType: query.taskType };
    }
    if (query?.completed) {
      queryFilter = {
        ...queryFilter,
        markAsCompletedAt: query.completed ? { $ne: null } : null,
      };
    }

    const projection =
      'id ownerId relatedToId collaborators taskType title description dueDate dueDatetime markAsCompletedAt';

    const tasks = await this._taskProvider.TaskModel.find(
      queryFilter,
      projection,
      { sort: { createdAt: -1 }, limit: 100 }
    ).exec();

    return tasks.map(
      (task) =>
        ({
          id: task.id,
          ownerId: task.ownerId,
          relatedToId: task.relatedToId,
          taskType: task.taskType,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate.date,
          dueDatetime: task.dueDate.time,
          markedAsCompleted: task.markAsCompletedAt !== null,
        } as FindAllTasksQueryResponse)
    ) as FindAllTasksQueryResponse[];
  }
}
