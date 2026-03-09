import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { LeadProvider } from '../lead.provider';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactTypeEnum } from '../../contacts/contact.schema';

export class DeleteLeadCommand {
  @ApiProperty({ required: true, description: 'Lead Id', type: String })
  id!: string;
}

@Injectable()
export class DeleteLeadCommandHandler
  implements CommandHandler<DeleteLeadCommand, void>
{
  constructor(private readonly leadProvider: LeadProvider) {}

  async handlerAsync(command: DeleteLeadCommand): Promise<void> {
    const lead = await this.leadProvider.ContactModel.findOne({
      _id: command.id,
      type: ContactTypeEnum.Lead,
      deletedAt: null,
    })
      .lean()
      .exec();

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    await this.leadProvider.ContactModel.findByIdAndUpdate(command.id, {
      $set: {
        deletedAt: new Date(),
        updatedBy: this.leadProvider.user().userId,
        updatedByInfo: this.leadProvider.user(),
      },
    });
  }
}
