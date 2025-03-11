import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { ApiPaginationResponse } from '@lotchen/api/core';
import {
  PaginateAllContactsCommand,
  PaginateAllContactsCommandDto,
  PaginateAllContactsCommandHandler,
  PaginateAllContactsCommandRequest,
  PaginateAllContactsCommandResponse,
} from './paginate-all/paginate-all-contacts.command';

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
    private readonly _paginateAllContactsCommandHandler: PaginateAllContactsCommandHandler
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

  @Put(':id')
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
}
