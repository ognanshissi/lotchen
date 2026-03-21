export * from './create/create-campaign.command';
export * from './update/update-campaign.command';
export * from './find-by-id/find-campaign-by-id.query';
export * from './find-all/find-all-campaigns.query';
export * from './delete/delete-campaign.command';
export * from './estimate-audience/estimate-audience.query';
export * from './send/send-campaign.command';
export * from './analytics/campaign-analytics.query';
export * from './campaigns.controller';
export * from './campaign.schema';

import { CreateCampaignCommandHandler } from './create/create-campaign.command';
import { UpdateCampaignCommandHandler } from './update/update-campaign.command';
import { FindCampaignByIdQueryHandler } from './find-by-id/find-campaign-by-id.query';
import { FindAllCampaignsQueryHandler } from './find-all/find-all-campaigns.query';
import { DeleteCampaignCommandHandler } from './delete/delete-campaign.command';
import { EstimateAudienceQueryHandler } from './estimate-audience/estimate-audience.query';
import { SendCampaignCommandHandler } from './send/send-campaign.command';
import { CampaignAnalyticsQueryHandler } from './analytics/campaign-analytics.query';

export const campaignModuleHandlers = [
  CreateCampaignCommandHandler,
  UpdateCampaignCommandHandler,
  FindCampaignByIdQueryHandler,
  FindAllCampaignsQueryHandler,
  DeleteCampaignCommandHandler,
  EstimateAudienceQueryHandler,
  SendCampaignCommandHandler,
  CampaignAnalyticsQueryHandler,
];
