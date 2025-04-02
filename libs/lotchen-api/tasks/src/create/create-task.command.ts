import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Request } from 'express';
import { TaskProvider } from '../task.provider';

export enum TaskTypeEnum {
  FollowUp = 'follow up',
  CallReminder = 'call reminder',
}

export class CreateTaskCommand {
  @ApiProperty({ description: 'The user whom the task is assigned' })
  @IsNotEmpty()
  @IsUUID()
  ownerId!: string;

  @ApiProperty({ description: 'Entry related to entity' })
  relatedToId!: string;

  @ApiProperty({ description: 'Depending entry type' })
  relatedToType!: string;

  @ApiProperty({ enum: TaskTypeEnum, default: TaskTypeEnum.FollowUp })
  taskType!: string;

  @ApiProperty({ description: 'Task title' })
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Task description' })
  description!: string;

  @ApiProperty({ type: Date, description: 'Due Date' })
  dueDate!: Date;

  @ApiProperty({ type: String, description: 'Due Date' })
  dueDatetime!: Date;

  @ApiProperty({ description: 'Mark task as completed', type: Boolean })
  markedAsCompleted!: boolean;

  @ApiProperty({ description: 'Associate collaborator', type: [String] })
  collaboratorIds!: string[];
}

@Injectable()
export class CreateTaskCommandhandler
  implements CommandHandler<CreateTaskCommand, void>
{
  private readonly _logger = new Logger(CreateTaskCommand.name);

  constructor(public readonly taskProvider: TaskProvider) {}

  public async handlerAsync(command: CreateTaskCommand): Promise<void> {
    try {
      const task = new this.taskProvider.TaskModel({
        relatedToType: command.relatedToType,
        relatedToId: command.relatedToId,
        title: command.title,
        description: command.description,
        ownerId: command.ownerId,
        collaboratorIds: command.collaboratorIds,
        markAsCompletedAt: command.markedAsCompleted ? new Date() : null,
      });

      const errors = task.validateSync();

      if (errors) {
        throw new BadRequestException('');
      }

      await task.save();
    } catch (error) {
      this._logger.log('Failed saving task', JSON.stringify(error));
    }
  }
}
