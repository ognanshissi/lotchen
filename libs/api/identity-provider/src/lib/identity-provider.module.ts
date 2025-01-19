import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Profile, ProfileSchema } from './schemas/profile.schema';
import { CreateUserCommandHandler } from './application/users/create/create-user-command-handler';
import { GetAllUserQueryHandler } from './application/users/get-all/get-all-user-query-handler';
import { JwtModule } from '@nestjs/jwt';
import { LoginCommandHandler } from './application/auth/login/login-command';
import * as process from 'node:process';
import { AuthController } from './controllers/auth.controller';
import { RefreshTokenCommandHandler } from './application/auth/refresh-token/refresh-token.command';
import { ForgotPasswordCommandHandler } from './application/auth/forgot-password/forgot-password.command';
import { ResetPasswordCommandHandler } from './application/auth/reset-password/reset-password.command';
import { UserToken, UserTokenSchema } from './schemas/user-token.schema';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env['SECRET'],
      signOptions: {
        expiresIn: '1d',
      },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: UserToken.name, schema: UserTokenSchema },
    ]),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    CreateUserCommandHandler,
    GetAllUserQueryHandler,
    LoginCommandHandler,
    RefreshTokenCommandHandler,
    ForgotPasswordCommandHandler,
    ResetPasswordCommandHandler,
  ],
  exports: [],
})
export class IdentityProviderModule {}
