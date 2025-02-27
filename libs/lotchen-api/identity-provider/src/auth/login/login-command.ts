import { ApiProperty } from '@nestjs/swagger';
import { RequestHandler } from '@lotchen/api/core';
import { UserDocument, UserExtension } from '../../users';
import { Model } from 'mongoose';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { RoleDocument } from '../../roles';
import { AuthErrors } from '../auth-errors';
import { ProfileDocument } from '../../profile';

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
    @Inject('PROFILE_MODEL')
    private readonly profileModel: Model<ProfileDocument>,
    private readonly _jwtService: JwtService
  ) {}

  public async handlerAsync(
    request: LoginCommand
  ): Promise<AccessTokenResponse> {
    const userExist = await this.userModel
      .findOne({ email: request.email }, 'password roles isLocked email _id id')
      .populate({
        path: 'roles',
        select: 'id name permissions',
      })
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
      throw new UnauthorizedException(AuthErrors.userLocked);
    }

    // Get user profile
    const profile = await this.profileModel
      .findOne({ user: userExist.id }, 'firstName lastName id')
      .lean()
      .exec();

    const payload = {
      sub: userExist.id,
      username: userExist.email,
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      profileId: profile?._id ?? '',
      permissions: [...userExist.roles.map((role) => role.permissions).flat()],
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
