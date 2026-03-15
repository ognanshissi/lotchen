import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreatePipelineCommand,
  CreatePipelineCommandHandler,
} from './create/create-pipeline.command';
import {
  UpdatePipelineCommandRequest,
  UpdatePipelineCommandHandler,
} from './update/update-pipeline.command';
import { FindPipelineByIdQueryHandler } from './find-by-id/find-pipeline-by-id.query';
import { FindAllPipelinesQueryHandler } from './find-all/find-all-pipelines.query';
import { DeletePipelineCommandHandler } from './delete/delete-pipeline.command';
import { SetDefaultPipelineCommandHandler } from './set-default/set-default-pipeline.command';
import { PipelineAnalyticsQueryHandler } from '../analytics/pipeline-analytics.query';

@Controller({ path: 'sales-pipelines', version: '1' })
@ApiTags('Sales Pipelines')
export class SalesPipelinesController {
  constructor(
    private readonly _createHandler: CreatePipelineCommandHandler,
    private readonly _updateHandler: UpdatePipelineCommandHandler,
    private readonly _findByIdHandler: FindPipelineByIdQueryHandler,
    private readonly _findAllHandler: FindAllPipelinesQueryHandler,
    private readonly _deleteHandler: DeletePipelineCommandHandler,
    private readonly _setDefaultHandler: SetDefaultPipelineCommandHandler,
    private readonly _analyticsHandler: PipelineAnalyticsQueryHandler
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(@Body() command: CreatePipelineCommand): Promise<any> {
    return this._createHandler.handlerAsync(command);
  }

  @Get()
  public async findAll(): Promise<any[]> {
    return this._findAllHandler.handlerAsync({});
  }

  @Get(':id')
  public async findById(@Param('id') id: string): Promise<any> {
    return this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async update(
    @Param('id') id: string,
    @Body() request: UpdatePipelineCommandRequest
  ): Promise<void> {
    return this._updateHandler.handlerAsync({ id, ...request });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('id') id: string): Promise<void> {
    return this._deleteHandler.handlerAsync({ id });
  }

  @Patch(':id/set-default')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async setDefault(@Param('id') id: string): Promise<void> {
    return this._setDefaultHandler.handlerAsync({ id });
  }

  @Get(':id/analytics')
  public async analytics(
    @Param('id') id: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ): Promise<any> {
    return this._analyticsHandler.handlerAsync({ id, dateFrom, dateTo });
  }
}
