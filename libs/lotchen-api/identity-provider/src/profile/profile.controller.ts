import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@lotchen/api/core';
import {
  GetUserProfileQueryHandler,
  GetUserProfileQueryResponse,
} from './get-profile/get-user-profile.query';

@ApiHeader({
  name: 'x-tenant-fqn',
  description: 'The Tenant Fqn',
})
@ApiTags('Profile')
@Controller({
  version: '1',
  path: 'profile',
})
export class ProfileController {
  constructor(
    private readonly _getUserProfileQueryHandler: GetUserProfileQueryHandler
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiResponse({
    type: GetUserProfileQueryResponse,
  })
  public async currentUser(
    @Request() req: { user: { sub: string; username: string } }
  ) {
    return await this._getUserProfileQueryHandler.handlerAsync({
      userId: req.user.sub,
    });
  }
}
