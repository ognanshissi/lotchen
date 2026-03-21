import { Inject, Injectable, Provider } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { REQUEST } from '@nestjs/core';
import {
  MessageTemplate,
  MessageTemplateDocument,
  MessageTemplateSchema,
} from './templates';
import { Campaign, CampaignDocument, CampaignSchema } from './campaigns';
import {
  CampaignMessage,
  CampaignMessageDocument,
  CampaignMessageSchema,
} from './messages/campaign-message.schema';
import { ContactProvider } from '@lotchen/lotchen-api/contact';

export const MESSAGE_TEMPLATE_MODEL = 'MESSAGE_TEMPLATE_MODEL';
export const CAMPAIGN_MODEL = 'CAMPAIGN_MODEL';
export const CAMPAIGN_MESSAGE_MODEL = 'CAMPAIGN_MESSAGE_MODEL';
export const CAMPAIGN_CONTACT_MODEL = 'CAMPAIGN_CONTACT_MODEL';

@Injectable()
export class CampaignsProvider extends CurrentUserProvider {
  constructor(
    @Inject(MESSAGE_TEMPLATE_MODEL)
    public readonly MessageTemplateModel: Model<MessageTemplateDocument>,
    @Inject(CAMPAIGN_MODEL)
    public readonly CampaignModel: Model<CampaignDocument>,
    @Inject(CAMPAIGN_MESSAGE_MODEL)
    public readonly CampaignMessageModel: Model<CampaignMessageDocument>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}

export const campaignsProviders: Provider[] = [
  {
    provide: MESSAGE_TEMPLATE_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(
        MessageTemplate.name,
        MessageTemplateSchema
      );
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: CAMPAIGN_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Campaign.name, CampaignSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: CAMPAIGN_MESSAGE_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(
        CampaignMessage.name,
        CampaignMessageSchema
      );
    },
    inject: ['TENANT_CONNECTION'],
  },
  CampaignsProvider,
];
