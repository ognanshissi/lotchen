import { Module } from '@nestjs/common';
import { CoreModule } from '@lotchen/api/core';
import { campaignsProviders } from './campaigns.provider';
import {
  templateModuleHandlers,
  MessageTemplatesController,
} from './templates';
import { campaignModuleHandlers, CampaignsController } from './campaigns';
import { contactProviders } from '@lotchen/lotchen-api/contact';

@Module({
  imports: [CoreModule],
  controllers: [MessageTemplatesController, CampaignsController],
  providers: [
    ...contactProviders,
    ...campaignsProviders,
    ...templateModuleHandlers,
    ...campaignModuleHandlers,
  ],
})
export class CampaignsModule {}
