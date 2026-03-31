import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateCaptureConfigCommand,
  CreateCaptureConfigCommandHandler,
  CreateCaptureConfigResponse,
} from './create/create-capture-config.command';
import {
  FindAllCaptureConfigsQueryHandler,
  FindAllCaptureConfigsQueryResponse,
} from './find-all/find-all-capture-configs.query';
import {
  UpdateCaptureConfigCommandHandler,
  UpdateCaptureConfigCommandRequest,
} from './update/update-capture-config.command';
import { DeleteCaptureConfigCommandHandler } from './delete/delete-capture-config.command';
import {
  GenerateScriptQueryHandler,
  GenerateScriptResponse,
} from './generate-script/generate-script.query';
import {
  ImportLinkedInPostCommandHandler,
  ImportLinkedInPostCommandRequest,
  ImportLinkedInPostResponse,
} from '../capture/import-linkedin-post.command';

@ApiTags('Lead Capture Configs')
@Controller({ version: '1', path: 'lead-capture-configs' })
export class CaptureConfigController {
  constructor(
    private readonly _createHandler: CreateCaptureConfigCommandHandler,
    private readonly _findAllHandler: FindAllCaptureConfigsQueryHandler,
    private readonly _updateHandler: UpdateCaptureConfigCommandHandler,
    private readonly _deleteHandler: DeleteCaptureConfigCommandHandler,
    private readonly _generateScriptHandler: GenerateScriptQueryHandler,
    private readonly _importLinkedInPostHandler: ImportLinkedInPostCommandHandler
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Capture config created' })
  public async create(
    @Body() request: CreateCaptureConfigCommand
  ): Promise<CreateCaptureConfigResponse> {
    return await this._createHandler.handlerAsync(request);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'All capture configs',
    type: [FindAllCaptureConfigsQueryResponse],
  })
  public async findAll(): Promise<FindAllCaptureConfigsQueryResponse[]> {
    return await this._findAllHandler.handlerAsync();
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Capture config updated' })
  public async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: UpdateCaptureConfigCommandRequest
  ): Promise<void> {
    await this._updateHandler.handlerAsync({ id, ...request });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Capture config deleted (soft)' })
  public async delete(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<void> {
    await this._deleteHandler.handlerAsync({ id });
  }

  @Get(':id/script')
  @ApiResponse({
    status: 200,
    description: 'Generated JS capture script',
    type: GenerateScriptResponse,
  })
  public async generateScript(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<GenerateScriptResponse> {
    return await this._generateScriptHandler.handlerAsync({ id });
  }

  @Post(':id/import-linkedin-post')
  @ApiResponse({
    status: 201,
    description: 'LinkedIn post commenters imported as leads',
    type: ImportLinkedInPostResponse,
  })
  public async importLinkedInPost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: ImportLinkedInPostCommandRequest
  ): Promise<ImportLinkedInPostResponse> {
    return await this._importLinkedInPostHandler.handlerAsync({
      configId: id,
      ...request,
    });
  }
}
