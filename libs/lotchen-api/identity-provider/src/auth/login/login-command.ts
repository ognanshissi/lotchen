import { ApiProperty } from '@nestjs/swagger';
import { RequestHandler } from '@lotchen/api/core';
import { UserDocument, UserExtension } from '../../users';
import { Model } from 'mongoose';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { RoleDocument } from '../../roles';

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

  @ApiProperty()
  tokenType!: string;
}

@Injectable()
export class LoginCommandHandler
  implements RequestHandler<LoginCommand, AccessTokenResponse>
{
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDocument>,
    @Inject('ROLE_MODEL') private readonly roleModel: Model<RoleDocument>,
    private readonly _jwtService: JwtService
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

    if (userExist.isLocked) {
      throw new UnauthorizedException(
        'User is locked, please contact your administrator'
      );
    }

    // Get permissions from roles
    const roles = await this.roleModel
      .find(
        {
          id: { $in: [...userExist.roles.map((item) => item.toString())] },
        },
        'permissions'
      )
      .lean()
      .exec();

    const payload = {
      sub: userExist.id,
      username: userExist.email,
      permissions: [...roles.map((role) => role.permissions).flat()],
    };

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
}
