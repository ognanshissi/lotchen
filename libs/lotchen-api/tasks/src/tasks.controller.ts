import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateTaskCommand,
  CreateTaskCommandhandler,
} from './create/create-task.command';

@Controller({
  path: 'tasks',
  version: '1',
})
@ApiTags('Tasks')
export class TasksController {
  constructor(
    private readonly _createTaskCommandHandler: CreateTaskCommandhandler
  ) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  public async createTask(@Body() request: CreateTaskCommand): Promise<void> {
    return await this._createTaskCommandHandler.handlerAsync(request);
  }
}
