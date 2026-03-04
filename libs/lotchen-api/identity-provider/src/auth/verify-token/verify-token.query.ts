import {
  extractTokenFromHeader,
  QueryHandler,
  UnauthorizedExceptionOrAny,
} from '@lotchen/api/core';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiProperty } from '@nestjs/swagger';
import { Request } from 'express';

export class VerifyTokenQueryResponse {
  @ApiProperty({ description: 'Is the token valid' })
  isValid!: boolean;
}

@Injectable()
export class VerifyTokenQueryHandler
  implements
    QueryHandler<
      undefined,
      UnauthorizedExceptionOrAny<VerifyTokenQueryResponse>
    >
{
  constructor(private readonly _jwtService: JwtService) {}

  public async handlerAsync(
    query?: undefined,
    req?: Request
  ): Promise<VerifyTokenQueryResponse> {
    console.log('Verifying token...');

    const token = extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const isValid = await this._jwtService.verifyAsync(token); // Implement your token verification logic here

    return { isValid };
  }
}
