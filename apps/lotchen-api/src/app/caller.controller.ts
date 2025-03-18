import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { tokenGenerator, voiceResponse } from './handler';
import { Public, RequestExtendedWithUser } from '@lotchen/api/core';

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
  /**
   *
   * Twilio voice webhook endpoint
   *
   * @param res
   * @param body
   * @returns
   */
  @Post('voice')
  @Public()
  async voiceCall(@Res() res: Response, @Body() body: any) {
    res.headers.set('Content-Type', 'text/xml');
    return voiceResponse(body);
  }

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
