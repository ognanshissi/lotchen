import { QueryHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CampaignsProvider } from '../../campaigns.provider';

export class FindMessageTemplateByIdQuery {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class FindMessageTemplateByIdQueryHandler
  implements QueryHandler<FindMessageTemplateByIdQuery, any>
{
  constructor(private readonly campaignsProvider: CampaignsProvider) {}

  async handlerAsync(query: FindMessageTemplateByIdQuery): Promise<any> {
    const template = await this.campaignsProvider.MessageTemplateModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    return template;
  }
}
