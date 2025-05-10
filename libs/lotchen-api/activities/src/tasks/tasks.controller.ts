import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateTaskCommand,
  CreateTaskCommandHandler,
} from './create/create-task.command';
import {
  FindAllTasksQuery,
  FindAllTasksQueryHandler,
  FindAllTasksQueryResponse,
} from './find-all/find-all-tasks.query';
import { DeleteTaskCommandHandler } from './delete/delete-task.command';
import { CompleteTaskCommandHandler } from './complete-task/complete-task.command';

@Controller({
  path: 'tasks',
  version: '1',
})
@ApiTags('Tasks')
export class TasksController {
  constructor(
    private readonly _createTaskCommandHandler: CreateTaskCommandHandler,
    private readonly _findAllTasksQueryHandler: FindAllTasksQueryHandler,
    private readonly _completeTaskCommandHandler: CompleteTaskCommandHandler,
    private readonly _deleteTaskCommandHandler: DeleteTaskCommandHandler
  ) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  public async createTask(@Body() request: CreateTaskCommand): Promise<void> {
    return await this._createTaskCommandHandler.handlerAsync(request);
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: FindAllTasksQueryResponse,
    isArray: true,
  })
  public async findAllTasks(
    @Query() query: FindAllTasksQuery
  ): Promise<FindAllTasksQueryResponse[]> {
    return await this._findAllTasksQueryHandler.handlerAsync(query);
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @Patch(':id/complete-task')
  public async completeTask(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<void> {
    return await this._completeTaskCommandHandler.handlerAsync({ taskId: id });
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @Delete(':id')
  public async deleteTask(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<void> {
    return await this._deleteTaskCommandHandler.handlerAsync({ taskId: id });
  }
}
