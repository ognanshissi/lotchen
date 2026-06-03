import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';
import { TaskTypeEnum } from '../task-type.enum';
import { ActivitiesProvider } from '../../activities.provider';

export class CreateTaskCommand {
  @ApiProperty({ description: 'The user whom the task is assigned' })
  @IsNotEmpty()
  @IsUUID()
  ownerId!: string;

  // Task can be related to a set of leads
  // For instance, an agent should work on 3 leads before 20/06/20226
  @ApiProperty({ description: 'Entry related to entity, contactId' })
  relatedToId!: string;

  @ApiProperty({ description: 'Depending entry type' })
  relatedToType!: string;

  @ApiProperty({ enum: TaskTypeEnum, default: TaskTypeEnum.FollowUp })
  @IsIn(Object.values(TaskTypeEnum))
  taskType!: string;

  @ApiProperty({ description: 'Task title' })
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Task description' })
  description!: string;

  @ApiProperty({ type: Date, description: 'Due Date' })
  dueDate!: Date;

  @ApiProperty({ type: String, description: 'Due DateTime' })
  dueDatetime!: Date;

  @ApiProperty({ description: 'Mark task as completed', type: Boolean })
  markedAsCompleted!: boolean;

  @ApiProperty({ description: 'Associate collaborator', type: [String] })
  collaboratorIds!: string[]; // Assignees

  @ApiProperty({
    description: 'Lead IDs for follow-up containers',
    type: [String],
  })
  leadIds!: string[];
}

@Injectable()
export class CreateTaskCommandHandler
  implements CommandHandler<CreateTaskCommand, void>
{
  private readonly _logger = new Logger(CreateTaskCommand.name);

  constructor(public readonly activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(command: CreateTaskCommand): Promise<void> {
    try {
      const task = new this.activitiesProvider.TaskModel({
        relatedToType: command.relatedToType,
        relatedToId: command.relatedToId,
        taskType: command.taskType,
        title: command.title,
        dueDate: {
          date: command.dueDate,
          time: command.dueDatetime,
        },
        description: command.description,
        ownerId: command.ownerId,
        collaboratorIds: command.collaboratorIds,
        leadIds: command.leadIds ?? [],
        markAsCompletedAt: command.markedAsCompleted ? new Date() : null,
        createdByInfo: this.activitiesProvider.user(),
        createdBy: this.activitiesProvider.user().userId,
      });

      const errors = task.validateSync();

      if (errors) {
        this._logger.log('Validation error', JSON.stringify(errors));
        throw new BadRequestException('');
      }

      await task.save();
    } catch (error) {
      this._logger.log('Failed saving task', JSON.stringify(error));
    }
  }
}
