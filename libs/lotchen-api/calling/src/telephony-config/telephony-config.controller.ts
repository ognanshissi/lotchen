import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  UpsertTelephonyConfigCommand,
  UpsertTelephonyConfigCommandHandler,
} from './upsert/upsert-telephony-config.command';
import {
  FindTelephonyConfigQueryHandler,
  FindTelephonyConfigResponse,
} from './find/find-telephony-config.query';
import {
  UpdateTelephonyConfigCommand,
  UpdateTelephonyConfigCommandHandler,
} from './update/update-telephony-config.command';

@Controller({
  path: 'telephony-config',
  version: '1',
})
@ApiTags('Telephony Config')
export class TelephonyConfigController {
  constructor(
    private readonly _upsertHandler: UpsertTelephonyConfigCommandHandler,
    private readonly _findHandler: FindTelephonyConfigQueryHandler,
    private readonly _updateHandler: UpdateTelephonyConfigCommandHandler
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Telephony config upserted' })
  @Post()
  public async upsert(
    @Body() command: UpsertTelephonyConfigCommand
  ): Promise<any> {
    return this._upsertHandler.handlerAsync(command);
  }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    type: FindTelephonyConfigResponse,
    description: 'Active telephony config',
  })
  @Get()
  public async find(): Promise<FindTelephonyConfigResponse | null> {
    return this._findHandler.handlerAsync();
  }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Telephony config updated' })
  @Patch(':id')
  public async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() command: UpdateTelephonyConfigCommand
  ): Promise<void> {
    command.id = id;
    return this._updateHandler.handlerAsync(command);
  }
}
