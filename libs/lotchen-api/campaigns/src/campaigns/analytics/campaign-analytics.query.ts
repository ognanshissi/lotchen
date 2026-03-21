import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CampaignsProvider } from '../../campaigns.provider';
import { MessageStatus } from '../../common/campaign.enums';

export class CampaignAnalyticsQuery {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

export class CampaignDto {}

export class CampaignSummaryDto {
  @ApiProperty({ type: Number })
  total!: number;
  @ApiProperty({ type: Number })
  sent!: number;
  @ApiProperty({ type: Number })
  delivered!: number;
  @ApiProperty({ type: Number, description: 'Bounced messages' })
  bounced!: number;
  @ApiProperty({ type: Number, description: 'Opened messages' })
  opened!: number;
  @ApiProperty({ type: Number, description: 'Clicked messages' })
  clicked!: number;
  @ApiProperty({ type: Number, description: 'Unsubscribed messages' })
  unsubscribed!: number;
  @ApiProperty({ type: Number, description: 'Failed messages' })
  failed!: number;
}

export class CampaignAnalyticsQueryResponse {
  @ApiProperty({ type: CampaignDto })
  campaign!: CampaignDto;
  @ApiProperty({ type: CampaignSummaryDto })
  summary!: CampaignSummaryDto;
  @ApiProperty({ type: Number })
  deliveryRate!: number;
  @ApiProperty({ type: Number })
  openRate!: number;
  @ApiProperty({ type: Number })
  clickRate!: number;
  @ApiProperty({ type: Number })
  bounceRate!: number;
  @ApiProperty({ type: [Object] })
  messages!: any[];
}

@Injectable()
export class CampaignAnalyticsQueryHandler
  implements
    QueryHandler<CampaignAnalyticsQuery, CampaignAnalyticsQueryResponse>
{
  constructor(private readonly campaignsProvider: CampaignsProvider) {}

  async handlerAsync(
    query: CampaignAnalyticsQuery
  ): Promise<CampaignAnalyticsQueryResponse> {
    const campaign = await this.campaignsProvider.CampaignModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Aggregate message statuses
    const statusAgg =
      await this.campaignsProvider.CampaignMessageModel.aggregate([
        { $match: { campaignId: query.id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

    const summary = {
      total: 0,
      sent: 0,
      delivered: 0,
      bounced: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      failed: 0,
    };

    for (const entry of statusAgg) {
      const status = entry._id as MessageStatus;
      const count = entry.count as number;
      summary.total += count;

      switch (status) {
        case MessageStatus.Sent:
          summary.sent += count;
          break;
        case MessageStatus.Delivered:
          summary.delivered += count;
          break;
        case MessageStatus.Bounced:
          summary.bounced += count;
          break;
        case MessageStatus.Opened:
          summary.opened += count;
          break;
        case MessageStatus.Clicked:
          summary.clicked += count;
          break;
        case MessageStatus.Unsubscribed:
          summary.unsubscribed += count;
          break;
        case MessageStatus.Failed:
          summary.failed += count;
          break;
      }
    }

    const messages = await this.campaignsProvider.CampaignMessageModel.find({
      campaignId: query.id,
    })
      .sort({ updatedAt: -1 })
      .lean();

    return {
      campaign,
      summary,
      deliveryRate: this.safeDiv(summary.delivered, summary.total),
      openRate: this.safeDiv(summary.opened, summary.total),
      clickRate: this.safeDiv(summary.clicked, summary.total),
      bounceRate: this.safeDiv(summary.bounced, summary.total),
      messages,
    };
  }

  private safeDiv = (count: number, total: number) =>
    total > 0 ? count / total : 0;
}
