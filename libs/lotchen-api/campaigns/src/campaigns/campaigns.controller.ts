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
  CreateCampaignCommand,
  CreateCampaignCommandHandler,
} from './create/create-campaign.command';
import {
  UpdateCampaignCommandRequest,
  UpdateCampaignCommandHandler,
} from './update/update-campaign.command';
import { FindCampaignByIdQueryHandler } from './find-by-id/find-campaign-by-id.query';
import { FindAllCampaignsQueryHandler } from './find-all/find-all-campaigns.query';
import { DeleteCampaignCommandHandler } from './delete/delete-campaign.command';
import {
  EstimateAudienceQuery,
  EstimateAudienceQueryHandler,
} from './estimate-audience/estimate-audience.query';
import { SendCampaignCommandHandler } from './send/send-campaign.command';
import { CampaignAnalyticsQueryHandler } from './analytics/campaign-analytics.query';
import { CampaignChannel, CampaignStatus } from '../common/campaign.enums';

@Controller({ path: 'campaigns', version: '1' })
@ApiTags('Campaigns')
export class CampaignsController {
  constructor(
    private readonly _createHandler: CreateCampaignCommandHandler,
    private readonly _updateHandler: UpdateCampaignCommandHandler,
    private readonly _findByIdHandler: FindCampaignByIdQueryHandler,
    private readonly _findAllHandler: FindAllCampaignsQueryHandler,
    private readonly _deleteHandler: DeleteCampaignCommandHandler,
    private readonly _estimateAudienceHandler: EstimateAudienceQueryHandler,
    private readonly _sendHandler: SendCampaignCommandHandler,
    private readonly _analyticsHandler: CampaignAnalyticsQueryHandler
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(@Body() command: CreateCampaignCommand): Promise<any> {
    return this._createHandler.handlerAsync(command);
  }

  @Get()
  public async findAll(
    @Query('status') status?: CampaignStatus,
    @Query('channel') channel?: CampaignChannel
  ): Promise<any[]> {
    return this._findAllHandler.handlerAsync({ status, channel });
  }

  @Get(':id')
  public async findById(@Param('id') id: string): Promise<any> {
    return this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async update(
    @Param('id') id: string,
    @Body() request: UpdateCampaignCommandRequest
  ): Promise<void> {
    return this._updateHandler.handlerAsync({ id, ...request });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('id') id: string): Promise<void> {
    return this._deleteHandler.handlerAsync({ id });
  }

  @Post('estimate-audience')
  public async estimateAudience(
    @Body() query: EstimateAudienceQuery
  ): Promise<{ count: number }> {
    return this._estimateAudienceHandler.handlerAsync(query);
  }

  @Patch(':id/send')
  public async send(@Param('id') id: string): Promise<any> {
    return this._sendHandler.handlerAsync({ id });
  }

  @Get(':id/analytics')
  public async analytics(@Param('id') id: string): Promise<any> {
    return this._analyticsHandler.handlerAsync({ id });
  }
}
