import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CampaignsProvider } from '../../campaigns.provider';
import { CampaignStatus, MessageStatus } from '../../common/campaign.enums';
import { ContactProvider } from '@lotchen/lotchen-api/contact';

export class SendCampaignCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class SendCampaignCommandHandler
  implements CommandHandler<SendCampaignCommand, any>
{
  constructor(
    private readonly campaignsProvider: CampaignsProvider,
    private readonly contactProvider: ContactProvider
  ) {}

  async handlerAsync(command: SendCampaignCommand): Promise<any> {
    const campaign = await this.campaignsProvider.CampaignModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (
      campaign.status !== CampaignStatus.Draft &&
      campaign.status !== CampaignStatus.Scheduled
    ) {
      throw new BadRequestException(
        'Campaign can only be sent from draft or scheduled status'
      );
    }

    // Build contact query from audience filters
    const contactFilter: Record<string, any> = { deletedAt: null };
    for (const f of campaign.audienceFilters || []) {
      switch (f.operator) {
        case 'eq':
          contactFilter[f.field] = f.value;
          break;
        case 'in':
          contactFilter[f.field] = {
            $in: Array.isArray(f.value) ? f.value : [f.value],
          };
          break;
        case 'contains':
          contactFilter[f.field] = { $regex: f.value, $options: 'i' };
          break;
        default:
          contactFilter[f.field] = f.value;
      }
    }

    const contacts = await this.contactProvider.ContactModel.find(
      contactFilter,
      { _id: 1, firstName: 1, lastName: 1, email: 1, mobileNumber: 1 }
    ).lean();

    const user = this.campaignsProvider.user();

    // Create CampaignMessage documents for each contact
    const messageDocs = contacts.map((contact: any) => ({
      campaignId: command.id,
      contactId: contact._id,
      contactName: `${contact.firstName || ''} ${
        contact.lastName || ''
      }`.trim(),
      contactEmail: contact.email,
      contactPhone: contact.mobileNumber,
      channel: campaign.channel,
      status: MessageStatus.Pending,
      createdBy: user.userId,
      createdByInfo: user,
    }));

    if (messageDocs.length > 0) {
      await this.campaignsProvider.CampaignMessageModel.insertMany(
        messageDocs,
        { ordered: false }
      );
    }

    // Update campaign status and stats
    await this.campaignsProvider.CampaignModel.findByIdAndUpdate(command.id, {
      $set: {
        status: CampaignStatus.Sending,
        sentAt: new Date(),
        audienceCount: contacts.length,
        'stats.total': contacts.length,
        updatedBy: user.userId,
        updatedByInfo: user,
      },
    });

    return {
      campaignId: command.id,
      status: CampaignStatus.Sending,
      audienceCount: contacts.length,
    };
  }
}
