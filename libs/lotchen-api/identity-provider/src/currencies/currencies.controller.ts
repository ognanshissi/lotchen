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
import { Permissions, PermissionsAction } from '@lotchen/api/core';
import {
  CreateCurrencyCommand,
  CreateCurrencyCommandHandler,
  CreateCurrencyCommandResponse,
} from './create/create-currency.command';
import {
  FindAllCurrenciesQueryHandler,
  FindAllCurrenciesQueryResponse,
} from './find-all/find-all-currencies.query';
import { UpdateCurrencyCommandHandler } from './update/update-currency.command';
import { DeleteCurrencyCommandHandler } from './delete/delete-currency.command';
import { SetDefaultCurrencyCommandHandler } from './set-default/set-default-currency.command';

@Controller({ version: '1', path: 'currencies' })
@ApiHeader({ name: 'x-tenant-fqn', description: 'The Tenant Fqn' })
@ApiTags('Currencies')
export class CurrenciesController {
  constructor(
    private readonly _createHandler: CreateCurrencyCommandHandler,
    private readonly _findAllHandler: FindAllCurrenciesQueryHandler,
    private readonly _updateHandler: UpdateCurrencyCommandHandler,
    private readonly _deleteHandler: DeleteCurrencyCommandHandler,
    private readonly _setDefaultHandler: SetDefaultCurrencyCommandHandler
  ) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateCurrencyCommandResponse,
  })
  async create(
    @Body() payload: CreateCurrencyCommand
  ): Promise<CreateCurrencyCommandResponse> {
    return this._createHandler.handlerAsync(payload);
  }

  @Get()
  @ApiResponse({ type: [FindAllCurrenciesQueryResponse] })
  async findAll(): Promise<FindAllCurrenciesQueryResponse[]> {
    return this._findAllHandler.handlerAsync();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: Omit<CreateCurrencyCommand, 'code'> & { code?: string }
  ): Promise<void> {
    return this._updateHandler.handlerAsync({ ...payload, id });
  }

  @Delete(':id')
  @Permissions(PermissionsAction.currencyManage)
  async delete(@Param('id') id: string): Promise<void> {
    return this._deleteHandler.handlerAsync({ id });
  }

  @Patch(':id/set-default')
  @Permissions(PermissionsAction.currencyManage)
  async setDefault(@Param('id') id: string): Promise<void> {
    return this._setDefaultHandler.handlerAsync({ id });
  }
}
