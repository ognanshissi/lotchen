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
  Query,
} from '@nestjs/common';
import { ApiPaginationResponse, Public } from '@lotchen/api/core';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateLeadCommand,
  CreateLeadCommandHandler,
  CreateLeadCommandResponse,
} from './create/create-lead.command';
import {
  PaginateAllLeadsCommandDto,
  PaginateAllLeadsCommandHandler,
  PaginateAllLeadsCommandRequest,
  PaginateAllLeadsCommandResponse,
} from './paginate-all/paginate-all-leads.command';
import {
  FindLeadByIdQueryHandler,
  FindLeadByIdQueryResponse,
} from './find-by-id/find-lead-by-id.query';
import {
  UpdateLeadCommandHandler,
  UpdateLeadCommandRequest,
} from './update/update-lead.command';
import { DeleteLeadCommandHandler } from './delete/delete-lead.command';
import {
  QualifyLeadCommandHandler,
  QualifyLeadCommandRequest,
} from './qualify/qualify-lead.command';
import {
  DisqualifyLeadCommandHandler,
  DisqualifyLeadCommandRequest,
} from './disqualify/disqualify-lead.command';
import {
  ConvertLeadCommandHandler,
  ConvertLeadCommandRequest,
} from './convert/convert-lead.command';
import {
  CaptureLeadCommand,
  CaptureLeadCommandHandler,
} from './capture/capture-lead.command';
import {
  WebhookLeadCommandHandler,
  WebhookLeadCommandRequest,
} from './capture/webhook-lead.command';
import {
  EnrichLeadCommandHandler,
  EnrichLeadCommandRequest,
} from './enrich/enrich-lead.command';

@ApiTags('Leads')
@Controller({ version: '1', path: 'leads' })
export class LeadsController {
  constructor(
    private readonly _createLeadCommandHandler: CreateLeadCommandHandler,
    private readonly _paginateAllLeadsCommandHandler: PaginateAllLeadsCommandHandler,
    private readonly _findLeadByIdQueryHandler: FindLeadByIdQueryHandler,
    private readonly _updateLeadCommandHandler: UpdateLeadCommandHandler,
    private readonly _deleteLeadCommandHandler: DeleteLeadCommandHandler,
    private readonly _qualifyLeadCommandHandler: QualifyLeadCommandHandler,
    private readonly _disqualifyLeadCommandHandler: DisqualifyLeadCommandHandler,
    private readonly _convertLeadCommandHandler: ConvertLeadCommandHandler,
    private readonly _captureLeadCommandHandler: CaptureLeadCommandHandler,
    private readonly _webhookLeadCommandHandler: WebhookLeadCommandHandler,
    private readonly _enrichLeadCommandHandler: EnrichLeadCommandHandler
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Lead created' })
  public async createLead(
    @Body() request: CreateLeadCommand
  ): Promise<CreateLeadCommandResponse> {
    return await this._createLeadCommandHandler.handlerAsync(request);
  }

  @Post('/paginate')
  @ApiPaginationResponse(PaginateAllLeadsCommandDto)
  @HttpCode(HttpStatus.OK)
  public async paginateAllLeads(
    @Body() command: PaginateAllLeadsCommandRequest,
    @Query('fields') fields: string
  ): Promise<PaginateAllLeadsCommandResponse> {
    return await this._paginateAllLeadsCommandHandler.handlerAsync({
      ...command,
      fields,
    });
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Lead found',
    type: FindLeadByIdQueryResponse,
  })
  public async findLeadById(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<FindLeadByIdQueryResponse> {
    return await this._findLeadByIdQueryHandler.handlerAsync({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Lead updated' })
  public async updateLead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: UpdateLeadCommandRequest
  ): Promise<void> {
    await this._updateLeadCommandHandler.handlerAsync({ id, ...request });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Lead deleted (soft)' })
  public async deleteLead(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<void> {
    await this._deleteLeadCommandHandler.handlerAsync({ id });
  }

  @Patch(':id/qualify')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Lead qualified' })
  public async qualifyLead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: QualifyLeadCommandRequest
  ): Promise<void> {
    await this._qualifyLeadCommandHandler.handlerAsync({ id, ...request });
  }

  @Patch(':id/disqualify')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Lead disqualified' })
  public async disqualifyLead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: DisqualifyLeadCommandRequest
  ): Promise<void> {
    await this._disqualifyLeadCommandHandler.handlerAsync({ id, ...request });
  }

  @Post(':id/convert')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Lead converted' })
  public async convertLead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: ConvertLeadCommandRequest
  ): Promise<void> {
    await this._convertLeadCommandHandler.handlerAsync({ id, ...request });
  }

  @Public()
  @Post('capture')
  @ApiResponse({
    status: 201,
    description: 'Lead captured from external source',
  })
  public async captureLead(@Body() request: CaptureLeadCommand): Promise<void> {
    await this._captureLeadCommandHandler.handlerAsync(request);
  }

  @Public()
  @Post('webhook/:platform')
  @ApiResponse({ status: 201, description: 'Lead captured from webhook' })
  public async webhookLead(
    @Param('platform') platform: string,
    @Body() request: WebhookLeadCommandRequest
  ): Promise<void> {
    await this._webhookLeadCommandHandler.handlerAsync({
      platform: platform as any,
      ...request,
    });
  }

  @Patch(':id/enrich')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Lead enriched' })
  public async enrichLead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: EnrichLeadCommandRequest
  ): Promise<void> {
    await this._enrichLeadCommandHandler.handlerAsync({ id, ...request });
  }
}
