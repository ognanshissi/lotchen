import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  LoginCommand,
  LoginCommandHandler,
  LoginCommandResponse,
} from '../application/auth/login/login-command';

@ApiTags('Identity Provider')
@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private readonly _loginCommandHandler: LoginCommandHandler) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  public async login(
    @Body() request: LoginCommand
  ): Promise<LoginCommandResponse> {
    return this._loginCommandHandler.handlerAsync(request);
  }
}
