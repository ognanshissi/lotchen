import { Controller, Post, Req } from '@nestjs/common';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { tokenGenerator } from './handler';
import { RequestExtendedWithUser } from '@lotchen/api/core';

export class TwilioAccessTokenResponse {
  @ApiProperty({ description: 'Toke' })
  token: string;

  @ApiProperty({ description: 'The connected Agent name', type: String })
  identity: string;
}

@Controller({
  path: 'caller',
  version: '1',
})
@ApiTags('Caller')
export class CallerController {
  @Post('token')
  @ApiResponse({
    type: TwilioAccessTokenResponse,
  })
  async token(
    @Req() request: RequestExtendedWithUser
  ): Promise<TwilioAccessTokenResponse> {
    // Update with a fully command handler,
    // the identity should be composed of `tenantId userId`
    return tokenGenerator(`${request.user.firstName}${request.user.lastName} `);
  }
}
