import { ApiProperty } from '@nestjs/swagger';
import { RequestHandler } from '@lotchen/api/core';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserExtension } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { UserToken } from '../../../schemas/user-token.schema';

export class LoginCommand {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;
  @ApiProperty()
  @IsNotEmpty()
  password!: string;
}

export class AccessTokenResponse {
  @ApiProperty()
  accessToken!: string;
  @ApiProperty()
  @IsNumber()
  expiresIn!: number;
  @ApiProperty()
  refreshToken!: string;
}

@Injectable()
export class LoginCommandHandler
  implements RequestHandler<LoginCommand, AccessTokenResponse>
{
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly _jwtService: JwtService,
    @InjectModel(UserToken.name) private readonly tokenModel: Model<UserToken>
  ) {}

  public async handlerAsync(
    request: LoginCommand
  ): Promise<AccessTokenResponse> {
    const userExist = await this.userModel
      .findOne({ email: request.email })
      .exec();

    if (!userExist) {
      throw new UnauthorizedException();
    }

    if (
      !(await UserExtension.comparePassword(
        request.password,
        userExist.password
      ))
    ) {
      throw new UnauthorizedException();
    }

    const payload = { sub: userExist.id, username: userExist.email };

    const refreshToken = await this._jwtService.signAsync(
      {
        ...payload,
        type: 'refreshToken',
      },
      {
        secret: process.env['SECRET'],
        expiresIn: '7d',
      }
    );
    await this.tokenModel.create({
      content: refreshToken,
      aim: 'refreshToken',
      user: userExist,
    });
    return {
      accessToken: await this._jwtService.signAsync(payload),
      refreshToken: refreshToken,
      expiresIn: 3600,
    } as AccessTokenResponse;
  }
}
