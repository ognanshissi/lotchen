import { Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateMeetingCommand,
  CreateMeetingCommandHandler,
} from './create/create-meeting.command';
import {
  FindAllMeetingsQuery,
  FindAllMeetingsQueryHandler,
  FindAllMeetingsQueryResponse,
} from './find-all/find-all-meetings.query';

@Controller({
  path: 'meetings',
  version: '1',
})
@ApiTags('Meetings')
export class MeetingsController {
  constructor(
    private readonly _createMeetingCommandHandler: CreateMeetingCommandHandler,
    private readonly _findAllMeetingsQueryHandler: FindAllMeetingsQueryHandler
  ) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateMeetingCommand,
    description: 'Create a new meeting',
  })
  public async createMeeting(request: CreateMeetingCommand): Promise<void> {
    return await this._createMeetingCommandHandler.handlerAsync(request);
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: FindAllMeetingsQueryResponse,
    isArray: true,
  })
  public async findAllMeetings(
    @Query() request: FindAllMeetingsQuery
  ): Promise<FindAllMeetingsQueryResponse[]> {
    return await this._findAllMeetingsQueryHandler.handlerAsync(request);
  }
}
