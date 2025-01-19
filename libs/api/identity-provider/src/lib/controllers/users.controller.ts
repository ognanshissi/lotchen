import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserCommandHandler } from '../application/users/create/create-user-command-handler';
import { CreateUserCommand } from '../application/users/create/create-user-command';
import { GetAllUserQueryHandler } from '../application/users/get-all/get-all-user-query-handler';
import { GetAllUserQuery } from '../application/users/get-all/get-all-user-query';

@ApiTags('Users')
@Controller({
  version: '1',
  path: 'users',
})
export class UsersController {
  constructor(
    private readonly _createUserHandler: CreateUserCommandHandler,
    private readonly _getAllUserQueryHandler: GetAllUserQueryHandler
  ) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: '2XX',
  })
  public async createUser(@Body() request: CreateUserCommand) {
    return await this._createUserHandler.handlerAsync(request);
  }

  @Get()
  @ApiResponse({
    type: GetAllUserQuery,
  })
  public async findAll() {
    return await this._getAllUserQueryHandler.handlerAsync();
  }
}
