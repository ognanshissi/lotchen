import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateTaskCommand,
  CreateTaskCommandhandler,
} from './create/create-task.command';
import {
  FindAllTasksQuery,
  FindAllTasksQueryHandler,
  FindAllTasksQueryResponse,
} from './find-all/find-all-tasks.query';

@Controller({
  path: 'tasks',
  version: '1',
})
@ApiTags('Tasks')
export class TasksController {
  constructor(
    private readonly _createTaskCommandHandler: CreateTaskCommandhandler,
    private readonly _findAllTasksQueryHandler: FindAllTasksQueryHandler
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
}
