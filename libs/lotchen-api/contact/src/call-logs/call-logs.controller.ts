import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateCallLogCommand,
  CreateCallLogCommandHandler,
} from './create-call-log/create-call-log.command';
import {
  FindAllCallLogsQueryHandler,
  FindAllCallLogsQueryResponse,
} from './find-call-logs/find-call-logs.query';

@Controller({
  path: 'call-logs',
  version: '1',
})
@ApiTags('Call Logs')
export class CallLogsController {
  constructor(
    private readonly _createCallLogCommandHandler: CreateCallLogCommandHandler,
    private readonly _findAllCallLogsQueryHandler: FindAllCallLogsQueryHandler
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Contact created',
  })
  @Post()
  public async createCallLog(
    @Body() request: CreateCallLogCommand
  ): Promise<void> {
    await this._createCallLogCommandHandler.handlerAsync(request);
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
