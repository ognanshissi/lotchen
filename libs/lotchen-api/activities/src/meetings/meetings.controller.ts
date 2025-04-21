import { Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateMeetingCommand,
  CreateMeetingCommandHandler,
} from './create/create-meeting.command';

@Controller({
  path: 'meetings',
  version: '1',
})
@ApiTags('Meetings')
export class MeetingsController {
  constructor(
    private readonly _createMeetingCommandHandler: CreateMeetingCommandHandler
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
}
