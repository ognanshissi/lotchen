import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateClientCommand,
  CreateClientCommandHandler,
  CreateClientCommandResponse,
} from './create/create-client.command';
import {
  FindAllClientsQueryHandler,
  PaginateAllClientsRequest,
  PaginateAllClientsResponse,
} from './find-all/find-all-clients.query';
import {
  FindClientByIdQueryHandler,
  FindClientByIdQueryResponse,
} from './find-by-id/find-client-by-id.query';
import {
  UpdateClientCommandHandler,
  UpdateClientCommand,
} from './update/update-client.command';
import { DeleteClientCommandHandler } from './delete/delete-client.command';

@Controller({ version: '1', path: 'clients' })
@ApiHeader({ name: 'x-tenant-fqn', description: 'The Tenant Fqn' })
@ApiTags('Clients')
export class ClientController {
  constructor(
    private readonly _createHandler: CreateClientCommandHandler,
    private readonly _findAllHandler: FindAllClientsQueryHandler,
    private readonly _findByIdHandler: FindClientByIdQueryHandler,
    private readonly _updateHandler: UpdateClientCommandHandler,
    private readonly _deleteHandler: DeleteClientCommandHandler
  ) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateClientCommandResponse,
  })
  async create(
    @Body() payload: CreateClientCommand
  ): Promise<CreateClientCommandResponse> {
    return this._createHandler.handlerAsync(payload);
  }

  @Post('paginate')
  @ApiResponse({ type: PaginateAllClientsResponse })
  async paginate(
    @Body() payload: PaginateAllClientsRequest
  ): Promise<PaginateAllClientsResponse> {
    return this._findAllHandler.handlerAsync(payload);
  }

  @Get(':id')
  @ApiResponse({ type: FindClientByIdQueryResponse })
  async findById(
    @Param('id') id: string
  ): Promise<FindClientByIdQueryResponse> {
    return this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: Omit<UpdateClientCommand, 'id'>
  ): Promise<void> {
    return this._updateHandler.handlerAsync({ ...payload, id });
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this._deleteHandler.handlerAsync({ id });
  }
}
