import { extractTokenFromHeader, QueryHandler } from '@lotchen/api/core';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

export class GetMeQueryResponse {
  @ApiProperty({ description: 'User ID' })
  userId!: string;

  @ApiProperty({ description: 'Email address' })
  email!: string;

  @ApiProperty({ description: 'First name' })
  firstName!: string;

  @ApiProperty({ description: 'Last name' })
  lastName!: string;

  @ApiProperty({ description: 'Profile ID' })
  profileId!: string;

  @ApiProperty({ description: 'List of granted permissions', type: [String] })
  permissions!: string[];
}

@Injectable()
export class GetMeQueryHandler
  implements QueryHandler<undefined, GetMeQueryResponse>
{
  public constructor(private readonly _jwtService: JwtService) {}

  public async handlerAsync(
    _query?: undefined,
    req?: Request
  ): Promise<GetMeQueryResponse> {
    const token = extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const userInfo = await this._jwtService.verifyAsync(token, {
      secret: process.env['SECRET'],
    });

    if (!userInfo) {
      throw new UnauthorizedException('Invalid token');
    }
    return {
      userId: userInfo.sub,
      email: userInfo.username,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      profileId: userInfo.profileId,
      permissions: userInfo.permissions,
    } as GetMeQueryResponse;
  }
}
