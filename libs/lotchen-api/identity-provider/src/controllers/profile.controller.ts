import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import {
  GetUserProfileQueryHandler,
  GetUserProfileQueryResponse,
} from '../application/profile/get-profile/get-user-profile.query';
import {
  AssignPermissionsCommandHandler,
  AssignPermissionsCommandRequest,
} from '../application/profile/assign-permissions/assign-permissions.command';

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
    private readonly _getUserProfileQueryHandler: GetUserProfileQueryHandler,
    private readonly _assignPermissionsCommandHandler: AssignPermissionsCommandHandler
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

  // @UseGuards(AuthGuard)
  @Put(':userId/assign-permissions')
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  async assignPermissions(
    @Body() body: AssignPermissionsCommandRequest,
    @Param('userId') userId: string
  ): Promise<void> {
    await this._assignPermissionsCommandHandler.handlerAsync({
      userId,
      permissions: body.permissions,
    });
  }
}
