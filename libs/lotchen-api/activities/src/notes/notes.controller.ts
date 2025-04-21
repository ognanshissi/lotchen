import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
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
import { DeleteNoteCommandHandler } from './delete/delete-note.command';

@Controller({
  path: 'notes',
  version: '1',
})
@ApiTags('Notes')
export class NotesController {
  constructor(
    private readonly _createNoteCommandHandler: CreateNoteCommandHandler,
    private readonly _findAllNotesQueryHandler: FindAllNotesQueryHandler,
    private readonly _deleteNoteCommandHandler: DeleteNoteCommandHandler
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

  @Delete(':id')
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  public async deleteNote(
    @Query('id', new ParseUUIDPipe()) noteId: string
  ): Promise<void> {
    return await this._deleteNoteCommandHandler.handlerAsync({ noteId });
  }
}
