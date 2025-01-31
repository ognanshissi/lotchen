import { LoginCommandHandler } from './login/login-command';
import { RefreshTokenCommandHandler } from './refresh-token/refresh-token.command';
import { ResetPasswordCommandHandler } from './reset-password/reset-password.command';
import { ForgotPasswordCommandHandler } from './forgot-password/forgot-password.command';

export * from './auth.controller';
export * from './forgot-password/forgot-password.command';
export * from './login/login-command';
export * from './reset-password/reset-password.command';
export * from './refresh-token/refresh-token.command';

export const authHandlers = [
  LoginCommandHandler,
  RefreshTokenCommandHandler,
  ResetPasswordCommandHandler,
  ForgotPasswordCommandHandler,
];
