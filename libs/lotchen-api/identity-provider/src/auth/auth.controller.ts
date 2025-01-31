import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AccessTokenResponse,
  LoginCommand,
  LoginCommandHandler,
} from './login/login-command';
import {
  RefreshTokenCommand,
  RefreshTokenCommandHandler,
} from './refresh-token/refresh-token.command';
import { Request as ExpressRequest } from 'express';
import {
  ForgotPasswordCommand,
  ForgotPasswordCommandHandler,
  ForgotPasswordCommandResponse,
} from './forgot-password/forgot-password.command';
import {
  ResetPasswordCommand,
  ResetPasswordCommandHandler,
  ResetPasswordCommandResponse,
} from './reset-password/reset-password.command';

@ApiHeader({
  name: 'x-tenant-fqn',
  description: 'The Tenant Fqn',
})
@ApiTags('Auth')
@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private readonly _loginCommandHandler: LoginCommandHandler,
    private readonly _refreshTokenCommandHandler: RefreshTokenCommandHandler,
    private readonly _forgotPasswordCommandHandler: ForgotPasswordCommandHandler,
    private readonly _resetPasswordCommandHandler: ResetPasswordCommandHandler
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiResponse({
    type: AccessTokenResponse,
  })
  public async login(
    @Body() request: LoginCommand
  ): Promise<AccessTokenResponse> {
    return this._loginCommandHandler.handlerAsync(request);
  }

  @ApiResponse({
    type: AccessTokenResponse,
  })
  @Post('refresh-token')
  async refreshToken(
    @Body() command: RefreshTokenCommand,
    @Request() req: ExpressRequest
  ): Promise<AccessTokenResponse> {
    return await this._refreshTokenCommandHandler.handlerAsync(command, req);
  }

  @Post('forgot-password')
  @ApiResponse({
    type: ForgotPasswordCommandResponse,
  })
  async forgotPassword(
    @Body() request: ForgotPasswordCommand
  ): Promise<ForgotPasswordCommandResponse> {
    return await this._forgotPasswordCommandHandler.handlerAsync(request);
  }

  @Post('reset-password')
  @ApiResponse({
    type: ResetPasswordCommandResponse,
  })
  async resetPassword(
    @Body() request: ResetPasswordCommand
  ): Promise<ResetPasswordCommandResponse> {
    return await this._resetPasswordCommandHandler.handlerAsync(request);
  }
}
