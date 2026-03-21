import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CampaignsProvider } from '../../campaigns.provider';

export class DeleteCampaignCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class DeleteCampaignCommandHandler
  implements CommandHandler<DeleteCampaignCommand, void>
{
  constructor(private readonly campaignsProvider: CampaignsProvider) {}

  async handlerAsync(command: DeleteCampaignCommand): Promise<void> {
    const campaign = await this.campaignsProvider.CampaignModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    await this.campaignsProvider.CampaignModel.findByIdAndUpdate(command.id, {
      $set: {
        deletedAt: new Date(),
        updatedBy: this.campaignsProvider.user().userId,
      },
    });
  }
}
