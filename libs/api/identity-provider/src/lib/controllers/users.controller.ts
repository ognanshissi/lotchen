import { Body, Controller, Get, Post, Version } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { Profile } from '../schemas/profile.schema';
import { CreateUserCommandHandler } from '../application/users/create/create-user-command-handler';
import { CreateUserCommand } from '../application/users/create/create-user-command';
import { GetAllUserQueryHandler } from '../application/users/get-all/get-all-user-query-handler';
import { GetAllUserQuery } from '../application/users/get-all/get-all-user-query';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @InjectModel(Profile.name) private readonly profileModel: Model<Profile>,
    private readonly _createUserHandler: CreateUserCommandHandler,
    private readonly _getAllUserQueryHandler: GetAllUserQueryHandler
  ) {}

  @Post()
  @Version('1')
  public async createUser(@Body() request: CreateUserCommand) {
    return await this._createUserHandler.handlerAsync(request);
  }

  @Get()
  @Version('1')
  @ApiResponse({
    type: GetAllUserQuery,
  })
  public async findAll() {
    return await this._getAllUserQueryHandler.handlerAsync();
  }
}
