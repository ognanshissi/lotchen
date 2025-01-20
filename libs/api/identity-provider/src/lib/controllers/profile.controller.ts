import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import {
  GetUserProfileQueryHandler,
  GetUserProfileQueryResponse,
} from '../application/profile/get-profile/get-user-profile.query';

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
  public async profile(
    @Request() req: { user: { sub: string; username: string } }
  ) {
    return await this._getUserProfileQueryHandler.handlerAsync({
      userId: req.user.sub,
    });
  }
}
