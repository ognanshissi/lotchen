import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Model } from 'mongoose';
import { User, UserToken } from '../../users';
import { Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ForgotPasswordEvent,
  USER_FORGOT_PASSWORD_EVENT,
} from './forgot-password.event';
import { JwtService } from '@nestjs/jwt';

export class ForgotPasswordCommand {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email!: string;

  @ApiProperty({
    description:
      'Url where the user will be redirected after clicking on the link inside the mail',
  })
  redirectPath!: string;
}

export class ForgotPasswordCommandResponse {
  @ApiProperty()
  message!: string;

  @ApiProperty()
  url!: string | URL;
}

export class ForgotPasswordCommandHandler
  implements
    CommandHandler<ForgotPasswordCommand, ForgotPasswordCommandResponse>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    @Inject('USER_TOKEN_MODEL')
    private readonly userTokenModel: Model<UserToken>,
    private _eventEmitter: EventEmitter2,
    private readonly _jwtService: JwtService
  ) {}

  public async handlerAsync(
    request: ForgotPasswordCommand
  ): Promise<ForgotPasswordCommandResponse> {
    const user = await this.userModel.findOne({ email: request.email }).exec();

    if (!user) {
      throw new NotFoundException();
    }

    const payload = {
      sub: user.id,
      username: user.email,
      type: 'forgotPassword',
    };

    const token = await this._jwtService.signAsync(payload, {
      secret: process.env['SECRET'],
      expiresIn: '1h',
    });

    await this.userTokenModel.create({
      content: token,
      aim: payload.type,
      user: user,
    });
    // Token is valid for one hour

    this._eventEmitter.emit(
      USER_FORGOT_PASSWORD_EVENT,
      new ForgotPasswordEvent(user.email, token)
    );

    return {
      message: `Un email a été envoyé à l'adresse : ${user.email}`,
      url: new URL(`${request.redirectPath}?token=${token}`),
    };
  }
}
