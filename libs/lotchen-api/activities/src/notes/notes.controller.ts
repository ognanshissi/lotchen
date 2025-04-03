import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateNoteCommand,
  CreateNoteCommandHandler,
} from './create/create-note.command';
import {
  FindAllNotesQuery,
  FindAllNotesQueryHandler,
  FindAllNotesQueryResponse,
} from './find-all/find-all-notes.query';

@Controller({
  path: 'notes',
  version: '1',
})
@ApiTags('Notes')
export class NotesController {
  constructor(
    private readonly _createNoteCommandHandler: CreateNoteCommandHandler,
    private readonly _findAllNotesQueryHandler: FindAllNotesQueryHandler
  ) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  public async createNote(@Body() request: CreateNoteCommand): Promise<void> {
    return await this._createNoteCommandHandler.handlerAsync(request);
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: FindAllNotesQueryResponse,
    isArray: true,
  })
  public async findAllNotes(
    @Query() request: FindAllNotesQuery
  ): Promise<FindAllNotesQueryResponse[]> {
    return await this._findAllNotesQueryHandler.handlerAsync(request);
  }
}
