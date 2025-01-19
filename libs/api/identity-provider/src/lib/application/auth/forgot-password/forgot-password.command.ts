import { CommandHandler, RequestHandler } from '@lotchen/api/core';
import { InjectModel } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Model } from 'mongoose';
import { User } from '../../../schemas/user.schema';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ForgotPasswordEvent,
  UserForgotPassword,
} from './forgot-password.event';
import { JwtService } from '@nestjs/jwt';
import { Url } from 'url';

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
    @InjectModel(User.name) private readonly userModel: Model<User>,
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

    // Token is valid for one hour

    this._eventEmitter.emit(
      UserForgotPassword,
      new ForgotPasswordEvent(user.email, token)
    );

    return {
      message: `Un email a été envoyé à l'adresse : ${user.email}`,
      url: new URL(`${request.redirectPath}?token=${token}`),
    };
  }
}
