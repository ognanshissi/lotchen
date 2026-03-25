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
import { Public } from '@lotchen/api/core';
import {
  CreateCallLogCommand,
  CreateCallLogCommandHandler,
} from './create-call-log/create-call-log.command';
import {
  FindAllCallLogsQueryHandler,
  FindAllCallLogsQueryResponse,
} from './find-call-logs/find-call-logs.query';
import {
  UpdateCallLogCommand,
  UpdateCallLogCommandHandler,
} from './update-call-log/update-call-log.command';
import {
  RecordingCallbackCommand,
  RecordingCallbackCommandHandler,
} from './recording-callback/recording-callback.command';

@Controller({
  path: 'call-logs',
  version: '1',
})
@ApiTags('Call Logs')
export class CallLogsController {
  constructor(
    private readonly _createCallLogCommandHandler: CreateCallLogCommandHandler,
    private readonly _findAllCallLogsQueryHandler: FindAllCallLogsQueryHandler,
    private readonly _updateCallLogCommandHandler: UpdateCallLogCommandHandler,
    private readonly _recordingCallbackCommandHandler: RecordingCallbackCommandHandler
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Call log created',
  })
  @Post()
  public async createCallLog(
    @Body() request: CreateCallLogCommand
  ): Promise<void> {
    await this._createCallLogCommandHandler.handlerAsync(request);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Recording callback received' })
  @Post('recording-callback')
  public async recordingCallback(
    @Body() command: RecordingCallbackCommand
  ): Promise<void> {
    await this._recordingCallbackCommandHandler.handlerAsync(command);
  }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Call log updated' })
  @Patch(':id')
  public async updateCallLog(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() command: UpdateCallLogCommand
  ): Promise<void> {
    command.id = id;
    await this._updateCallLogCommandHandler.handlerAsync(command);
  }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Get all call logs',
    type: FindAllCallLogsQueryResponse,
    isArray: true,
  })
  @Get(':relatedToId')
  public async findAllCallLogs(
    @Param('relatedToId', new ParseUUIDPipe()) relatedId: string
  ): Promise<FindAllCallLogsQueryResponse[]> {
    return await this._findAllCallLogsQueryHandler.handlerAsync({
      entityId: relatedId,
    });
  }
}
