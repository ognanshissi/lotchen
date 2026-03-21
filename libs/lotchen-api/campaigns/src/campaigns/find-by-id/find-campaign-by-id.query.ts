import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CampaignsProvider } from '../../campaigns.provider';

export class FindCampaignByIdQuery {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class FindCampaignByIdQueryHandler
  implements QueryHandler<FindCampaignByIdQuery, any>
{
  constructor(private readonly campaignsProvider: CampaignsProvider) {}

  async handlerAsync(query: FindCampaignByIdQuery): Promise<any> {
    const campaign = await this.campaignsProvider.CampaignModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }
}
