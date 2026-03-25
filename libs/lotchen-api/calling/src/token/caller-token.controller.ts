import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CallerTokenResponse,
  GenerateCallerTokenCommandHandler,
} from './generate-token.command';

@Controller({
  path: 'caller',
  version: '1',
})
@ApiTags('Caller')
export class CallerTokenController {
  constructor(
    private readonly _generateTokenHandler: GenerateCallerTokenCommandHandler
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: CallerTokenResponse })
  @Post('token')
  public async token(): Promise<CallerTokenResponse> {
    return this._generateTokenHandler.handlerAsync();
  }
}
