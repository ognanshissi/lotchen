import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  public users() {
    // Logic to list users will go here
    return 'This action returns a list of users';
  }
}
