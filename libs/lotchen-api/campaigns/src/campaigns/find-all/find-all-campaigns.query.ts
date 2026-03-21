import { QueryHandler } from '@lotchen/api/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { IsOptional, IsEnum } from 'class-validator';
import { CampaignsProvider } from '../../campaigns.provider';
import { CampaignChannel, CampaignStatus } from '../../common/campaign.enums';

export class FindAllCampaignsQuery {
  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ enum: CampaignChannel })
  @IsOptional()
  @IsEnum(CampaignChannel)
  channel?: CampaignChannel;
}

@Injectable()
export class FindAllCampaignsQueryHandler
  implements QueryHandler<FindAllCampaignsQuery, any[]>
{
  constructor(private readonly campaignsProvider: CampaignsProvider) {}

  async handlerAsync(query: FindAllCampaignsQuery): Promise<any[]> {
    const filter: Record<string, any> = { deletedAt: null };

    if (query.status) {
      filter['status'] = query.status;
    }
    if (query.channel) {
      filter['channel'] = query.channel;
    }

    return this.campaignsProvider.CampaignModel.find(filter)
      .sort({ updatedAt: -1 })
      .lean();
  }
}
