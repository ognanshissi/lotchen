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
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreateContactCommand,
  CreateContactCommandHandler,
} from './create/create-contact.command';
import {
  FindAllContactsQuery,
  FindAllContactsQueryHandler,
  FindAllContactsQueryResponse,
} from './find-all/find-all-contacts.query';
import {
  FindContactByIdQueryResponse,
  FindContactByQueryHandler,
} from './find-by-id/find-contact-by-id.query';
import {
  UpdateContactCommandHandler,
  UpdateContactCommandRequest,
} from './update/update-contact.command';
import { ApiPaginationResponse, uploadConfig } from '@lotchen/api/core';
import {
  PaginateAllContactsCommandDto,
  PaginateAllContactsCommandHandler,
  PaginateAllContactsCommandRequest,
  PaginateAllContactsCommandResponse,
} from './paginate-all/paginate-all-contacts.command';
import { ImportContactsExcelCommandHandler } from './import-contacts-excel/import-contacts-excel.command';
import {
  CreateCallLogCommand,
  CreateCallLogCommandHandler,
} from '../call-logs/create-call-log/create-call-log.command';

@ApiTags('Contacts')
@Controller({
  version: '1',
  path: 'contacts',
})
export class ContactsController {
  constructor(
    private readonly _createContactCommandHandler: CreateContactCommandHandler,
    private readonly _findAllContactsQueryHandler: FindAllContactsQueryHandler,
    private readonly _findContactByIdQueryHandler: FindContactByQueryHandler,
    private readonly _updateContactCommandHandler: UpdateContactCommandHandler,
    private readonly _paginateAllContactsCommandHandler: PaginateAllContactsCommandHandler,
    private readonly _importContactsExcelCommandHandler: ImportContactsExcelCommandHandler
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Contact created',
  })
  public async createContact(
    @Body() request: CreateContactCommand
  ): Promise<void> {
    await this._createContactCommandHandler.handlerAsync(request);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Contacts found',
    type: FindAllContactsQueryResponse,
    isArray: true,
  })
  public async findAllContacts(
    @Query() query: FindAllContactsQuery
  ): Promise<FindAllContactsQueryResponse[]> {
    return await this._findAllContactsQueryHandler.handlerAsync(query);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Contact found',
    type: FindContactByIdQueryResponse,
  })
  public async findContactById(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<FindContactByIdQueryResponse> {
    return await this._findContactByIdQueryHandler.handlerAsync({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Contact updated',
  })
  public async updateContact(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: UpdateContactCommandRequest
  ): Promise<void> {
    await this._updateContactCommandHandler.handlerAsync({ id, ...request });
  }

  @Post('/paginate')
  @ApiPaginationResponse(PaginateAllContactsCommandDto)
  @HttpCode(HttpStatus.OK)
  async paginateAllTerritories(
    @Body() command: PaginateAllContactsCommandRequest,
    @Query('fields') fields: string
  ): Promise<PaginateAllContactsCommandResponse> {
    return await this._paginateAllContactsCommandHandler.handlerAsync({
      ...command,
      fields,
    });
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file', uploadConfig))
  async importContactsExcel(
    @UploadedFile() file: Express.Multer.File
  ): Promise<any> {
    return this._importContactsExcelCommandHandler.handlerAsync({
      excelFile: file?.path,
    });
  }
}
