import { CommandHandler, RequestHandler } from '@lotchen/api/core';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AccessTokenResponse } from '../login/login-command';
import { IsNotEmpty } from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../schemas/user.schema';
import { Model } from 'mongoose';
import { Request } from 'express';

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
    @InjectModel(User.name) private userModel: Model<User>
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

    const { sub } = await this._jwtService.decode<{ sub: string }>(token);

    const verifyRefreshToken = await this._jwtService.verifyAsync(
      command.refreshToken,
      { secret: process.env['SECRET'] }
    );

    if (!verifyRefreshToken) {
      throw new UnauthorizedException();
    }

    if (sub !== verifyRefreshToken['sub']) {
      throw new UnauthorizedException();
    }

    const userExist = await this.userModel
      .findOne({ email: verifyRefreshToken['username'] })
      .exec();

    if (!userExist) {
      throw new UnauthorizedException();
    }

    const payload = { sub: userExist.id, username: userExist.email };

    return {
      accessToken: await this._jwtService.signAsync(payload),
      refreshToken: await this._jwtService.signAsync(
        {
          ...payload,
          type: 'refreshToken',
        },
        {
          secret: process.env['SECRET'],
          expiresIn: '7d',
        }
      ),
      expiresIn: 3600,
    } as AccessTokenResponse;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
