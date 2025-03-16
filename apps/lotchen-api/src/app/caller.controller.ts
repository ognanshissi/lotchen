import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { tokenGenerator, voiceResponse } from './handler';
import { Public, RequestExtendedWithUser } from '@lotchen/api/core';

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
  async token(@Req() request: RequestExtendedWithUser) {
    return tokenGenerator(
      `${request.user.firstName} ${request.user.lastName} / ${request.user.username}`
    );
  }
}
