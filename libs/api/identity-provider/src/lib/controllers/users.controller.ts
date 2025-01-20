import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserCommandHandler } from '../application/users/create/create-user-command-handler';
import { CreateUserCommand } from '../application/users/create/create-user-command';
import { GetAllUserQueryHandler } from '../application/users/get-all/get-all-user-query-handler';
import { GetAllUserQuery } from '../application/users/get-all/get-all-user-query';
import {
  DeleteUserCommand,
  DeleteUserCommandHandler,
} from '../application/users/delete/delete-user.command';
import {
  FindUserByIdQueryHandler,
  FindUserByIdQueryResponse,
} from '../application/users/findby-id/find-user-by-id.query';

@ApiTags('Users')
@Controller({
  version: '1',
  path: 'users',
})
export class UsersController {
  constructor(
    private readonly _createUserHandler: CreateUserCommandHandler,
    private readonly _getAllUserQueryHandler: GetAllUserQueryHandler,
    private readonly _deleteUserCommandHandler: DeleteUserCommandHandler,
    private readonly _findUserByIdQueryHandler: FindUserByIdQueryHandler
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

  @Get(':id')
  @ApiResponse({
    type: FindUserByIdQueryResponse,
  })
  async findById(@Param('id') id: string) {
    return await this._findUserByIdQueryHandler.handlerAsync({ id });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() command: DeleteUserCommand) {
    await this._deleteUserCommandHandler.handlerAsync(command);
  }
}
