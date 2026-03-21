import { QueryHandler } from '@lotchen/api/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { CampaignsProvider } from '../../campaigns.provider';
import { CampaignChannel } from '../../common/campaign.enums';

export class FindAllMessageTemplatesQuery {
  @ApiPropertyOptional({ enum: CampaignChannel })
  @IsOptional()
  @IsEnum(CampaignChannel)
  channel?: CampaignChannel;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  category?: string;
}

@Injectable()
export class FindAllMessageTemplatesQueryHandler
  implements QueryHandler<FindAllMessageTemplatesQuery, any[]>
{
  constructor(private readonly campaignsProvider: CampaignsProvider) {}

  async handlerAsync(query: FindAllMessageTemplatesQuery): Promise<any[]> {
    const filter: Record<string, any> = { deletedAt: null };

    if (query.channel) {
      filter['channel'] = query.channel;
    }
    if (query.category) {
      filter['category'] = query.category;
    }

    return this.campaignsProvider.MessageTemplateModel.find(filter)
      .sort({ updatedAt: -1 })
      .lean();
  }
}
