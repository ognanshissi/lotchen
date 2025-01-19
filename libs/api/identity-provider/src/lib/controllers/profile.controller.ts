import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Profile')
@Controller({
  version: '1',
  path: 'profile',
})
export class ProfileController {
  @Get('me')
  @UseGuards(AuthGuard)
  public async profile(@Request() req: { user: unknown }) {
    return req.user;
  }
}
