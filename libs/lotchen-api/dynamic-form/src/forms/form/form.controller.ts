import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateFormCommand,
  CreateFormCommandHandler,
  CreateFormCommandResponse,
} from './create/create-form.command';
import {
  FindAllFormsQuery,
  FindAllFormsQueryHandler,
  FindAllFormsQueryResponse,
} from './find-all/find-all-forms.query';
import {
  FindFormByIdQueryHandler,
  FindFormByIdQueryResponse,
} from './find-by-id/find-form-by-id.query';
import { UpdateFormCommandHandler } from './update/update-form.command';
import {
  AddFieldCommand,
  AddFieldCommandHandler,
  AddFieldCommandResponse,
} from './add-field/add-field.command';
import { UpdateFieldCommandHandler } from './update-field/update-field.command';
import { RemoveFieldCommandHandler } from './remove-field/remove-field.command';
import {
  ReorderFieldsCommand,
  ReorderFieldsCommandHandler,
} from './reorder-fields/reorder-fields.command';
import {
  FindByClassNameQuery,
  FindByClassNameQueryHandler,
  FindByClassNameQueryResponse,
} from './find-by-class-name/find-by-class-name.query';

@Controller({ version: '1', path: 'dynamic-forms' })
@ApiHeader({ name: 'x-tenant-fqdn', description: 'The Tenant Fqdn' })
@ApiTags('Dynamic Forms')
export class FormController {
  constructor(
    private readonly _createHandler: CreateFormCommandHandler,
    private readonly _findAllHandler: FindAllFormsQueryHandler,
    private readonly _findByIdHandler: FindFormByIdQueryHandler,
    private readonly _updateHandler: UpdateFormCommandHandler,
    private readonly _addFieldHandler: AddFieldCommandHandler,
    private readonly _updateFieldHandler: UpdateFieldCommandHandler,
    private readonly _removeFieldHandler: RemoveFieldCommandHandler,
    private readonly _reorderFieldsHandler: ReorderFieldsCommandHandler,
    private readonly _findByClassNameHandler: FindByClassNameQueryHandler
  ) {}

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateFormCommandResponse,
  })
  async create(
    @Body() payload: CreateFormCommand
  ): Promise<CreateFormCommandResponse> {
    return this._createHandler.handlerAsync(payload);
  }

  @Get()
  @ApiResponse({ type: [FindAllFormsQueryResponse] })
  async findAll(
    @Query() query: FindAllFormsQuery
  ): Promise<FindAllFormsQueryResponse[]> {
    return this._findAllHandler.handlerAsync(query);
  }

  @Get('class-name')
  @ApiResponse({ type: FindByClassNameQueryResponse })
  async findByClassName(
    @Query() query: FindByClassNameQuery
  ): Promise<FindByClassNameQueryResponse> {
    return this._findByClassNameHandler.handlerAsync(query);
  }

  @Get(':id')
  @ApiResponse({ type: FindFormByIdQueryResponse })
  async findById(@Param('id') id: string): Promise<FindFormByIdQueryResponse> {
    return this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: Omit<CreateFormCommand, 'formClass'>
  ): Promise<void> {
    return this._updateHandler.handlerAsync({ ...payload, id });
  }

  @Post(':id/fields')
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AddFieldCommandResponse,
  })
  async addField(
    @Param('id') id: string,
    @Body() payload: AddFieldCommand
  ): Promise<AddFieldCommandResponse> {
    return this._addFieldHandler.handlerAsync({ ...payload, formId: id });
  }

  @Patch(':id/fields/reorder')
  async reorderFields(
    @Param('id') id: string,
    @Body() payload: ReorderFieldsCommand
  ): Promise<void> {
    return this._reorderFieldsHandler.handlerAsync({
      ...payload,
      formId: id,
    });
  }

  @Patch(':id/fields/:fieldId')
  async updateField(
    @Param('id') id: string,
    @Param('fieldId') fieldId: string,
    @Body() payload: Record<string, unknown>
  ): Promise<void> {
    return this._updateFieldHandler.handlerAsync({
      ...payload,
      formId: id,
      fieldId,
    } as never);
  }

  @Delete(':id/fields/:fieldId')
  async removeField(
    @Param('id') id: string,
    @Param('fieldId') fieldId: string
  ): Promise<void> {
    return this._removeFieldHandler.handlerAsync({ formId: id, fieldId });
  }
}
