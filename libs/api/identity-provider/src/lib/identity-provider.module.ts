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
    ]),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    CreateUserCommandHandler,
    GetAllUserQueryHandler,
    LoginCommandHandler,
  ],
  exports: [],
})
export class IdentityProviderModule {}
