import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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
import {
  FindMeetingByIdQueryHandler,
  FindMeetingByIdQueryResponse,
} from './find-by-id/find-meeting-by-id.query';
import {
  UpdateMeetingCommand,
  UpdateMeetingCommandHandler,
} from './update/update-meeting.command';
import { DeleteMeetingCommandHandler } from './delete/delete-meeting.command';
import {
  SetMeetingOutcomeCommand,
  SetMeetingOutcomeCommandHandler,
} from './set-outcome/set-meeting-outcome.command';
import {
  CheckMeetingConflictsQuery,
  CheckMeetingConflictsQueryHandler,
  ConflictingMeetingResponse,
} from './check-conflicts/check-meeting-conflicts.query';
import {
  FindMeetingsByRangeQuery,
  FindMeetingsByRangeQueryHandler,
  FindMeetingsByRangeResponse,
} from './find-by-range/find-meetings-by-range.query';

@Controller({
  path: 'meetings',
  version: '1',
})
@ApiTags('Meetings')
export class MeetingsController {
  constructor(
    private readonly _createMeetingCommandHandler: CreateMeetingCommandHandler,
    private readonly _findAllMeetingsQueryHandler: FindAllMeetingsQueryHandler,
    private readonly _findByIdHandler: FindMeetingByIdQueryHandler,
    private readonly _updateHandler: UpdateMeetingCommandHandler,
    private readonly _deleteHandler: DeleteMeetingCommandHandler,
    private readonly _setOutcomeHandler: SetMeetingOutcomeCommandHandler,
    private readonly _checkConflictsHandler: CheckMeetingConflictsQueryHandler,
    private readonly _findByRangeHandler: FindMeetingsByRangeQueryHandler
  ) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateMeetingCommand,
    description: 'Create a new meeting',
  })
  public async createMeeting(
    @Body() request: CreateMeetingCommand
  ): Promise<void> {
    return await this._createMeetingCommandHandler.handlerAsync(request);
  }

  @Get('conflicts')
  @ApiResponse({
    status: HttpStatus.OK,
    type: ConflictingMeetingResponse,
    isArray: true,
  })
  public async checkConflicts(
    @Query() query: CheckMeetingConflictsQuery
  ): Promise<ConflictingMeetingResponse[]> {
    return await this._checkConflictsHandler.handlerAsync(query);
  }

  @Get('range')
  @ApiResponse({
    status: HttpStatus.OK,
    type: FindMeetingsByRangeResponse,
    isArray: true,
  })
  public async findByRange(
    @Query() query: FindMeetingsByRangeQuery
  ): Promise<FindMeetingsByRangeResponse[]> {
    return await this._findByRangeHandler.handlerAsync(query);
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

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, type: FindMeetingByIdQueryResponse })
  public async findMeetingById(
    @Param('id') id: string
  ): Promise<FindMeetingByIdQueryResponse> {
    return await this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateMeeting(
    @Param('id') id: string,
    @Body() command: UpdateMeetingCommand
  ): Promise<void> {
    command.id = id;
    return await this._updateHandler.handlerAsync(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteMeeting(@Param('id') id: string): Promise<void> {
    return await this._deleteHandler.handlerAsync({ meetingId: id });
  }

  @Patch(':id/outcome')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async setOutcome(
    @Param('id') id: string,
    @Body() command: SetMeetingOutcomeCommand
  ): Promise<void> {
    command.id = id;
    return await this._setOutcomeHandler.handlerAsync(command);
  }
}
