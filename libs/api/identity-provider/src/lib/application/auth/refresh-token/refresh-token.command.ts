import { CommandHandler } from '@lotchen/api/core';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AccessTokenResponse } from '../login/login-command';
import { IsNotEmpty } from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { Request } from 'express';
import { UserToken } from '../../../schemas/user-token.schema';

export class RefreshTokenCommand {
  @IsNotEmpty()
  @ApiProperty()
  refreshToken!: string;
}

@Injectable()
export class RefreshTokenCommandHandler
  implements CommandHandler<RefreshTokenCommand, AccessTokenResponse>
{
  constructor(
    private readonly _jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserToken.name)
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
          usedAt: null,
        },
        'content'
      )
      .lean()
      .exec();

    if (!existingToken) {
      throw new UnauthorizedException();
    }

    // Get sub from the header bearer token
    const { sub } = await this._jwtService.decode<{ sub: string }>(token);

    if (sub !== verifyRefreshToken['sub']) {
      throw new UnauthorizedException();
    }

    const userExist = await this.userModel
      .findOne({ email: verifyRefreshToken['username'] })
      .exec();

    if (!userExist) {
      throw new UnauthorizedException();
    }

    // new tokens
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

    await this.userTokenModel.findOneAndUpdate(
      { content: existingToken.content },
      { usedAt: new Date() }
    ); // this action invalidate the token
    await this.userTokenModel.create({
      content: refreshToken,
      user: userExist,
    }); // save the new token

    return {
      accessToken: await this._jwtService.signAsync(payload),
      refreshToken: refreshToken,
      expiresIn: 3600,
    } as AccessTokenResponse;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
