import { CommandHandler } from '@lotchen/api/core';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AccessTokenResponse } from '../login/login-command';
import { IsNotEmpty } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { Request } from 'express';
import { UserToken } from '../../../schemas/user-token.schema';

export class RefreshTokenCommand {
  @IsNotEmpty({ message: 'refreshToken est obligatoire .' })
  @ApiProperty()
  refreshToken!: string;
}

@Injectable()
export class RefreshTokenCommandHandler
  implements CommandHandler<RefreshTokenCommand, AccessTokenResponse>
{
  constructor(
    private readonly _jwtService: JwtService,
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    @Inject('USER_TOKEN_MODEL')
    private readonly userTokenModel: Model<UserToken>
  ) {}

  public async handlerAsync(
    command: RefreshTokenCommand,
    request: Request
  ): Promise<AccessTokenResponse> {
    // get the user accessToken
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    // verify the refresh token using jwt service
    const verifyRefreshToken = await this._jwtService.verifyAsync(
      command.refreshToken,
      { secret: process.env['SECRET'] }
    );

    if (!verifyRefreshToken) {
      throw new UnauthorizedException();
    }

    // verify token from database
    const existingToken = await this.userTokenModel
      .findOne(
        {
          content: command.refreshToken,
        },
        'content'
      )
      .lean()
      .exec();

    if (existingToken) {
      throw new UnauthorizedException();
    }

    // Get sub from the header bearer token
    const { sub } = this._jwtService.decode<{ sub: string }>(token);

    if (sub !== verifyRefreshToken['sub']) {
      throw new UnauthorizedException();
    }

    const userExist = await this.userModel
      .findOne({ email: verifyRefreshToken['username'] })
      .exec();

    if (!userExist) {
      throw new UnauthorizedException();
    }

    // save the used refresh token
    await this.userTokenModel.create({
      content: command.refreshToken,
      user: userExist,
      aim: 'refreshToken',
      revokedAt: new Date(),
    }); // save the new token

    // new tokens
    const payload = { sub: userExist.id, username: userExist.email };

    const refreshToken = await this._jwtService.signAsync(
      {
        ...payload,
        type: 'refreshToken',
      },
      {
        secret: process.env['SECRET'],
        expiresIn: process.env['REFRESH_TOKEN_EXPIRES_IN'],
      }
    );

    return {
      accessToken: await this._jwtService.signAsync(payload),
      refreshToken: refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',
    } as AccessTokenResponse;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
