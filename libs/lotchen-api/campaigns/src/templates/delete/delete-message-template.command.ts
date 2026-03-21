import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CampaignsProvider } from '../../campaigns.provider';

export class DeleteMessageTemplateCommand {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class DeleteMessageTemplateCommandHandler
  implements CommandHandler<DeleteMessageTemplateCommand, void>
{
  constructor(private readonly campaignsProvider: CampaignsProvider) {}

  async handlerAsync(command: DeleteMessageTemplateCommand): Promise<void> {
    const template = await this.campaignsProvider.MessageTemplateModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).lean();

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    await this.campaignsProvider.MessageTemplateModel.findByIdAndUpdate(
      command.id,
      {
        $set: {
          deletedAt: new Date(),
          updatedBy: this.campaignsProvider.user().userId,
        },
      }
    );
  }
}
