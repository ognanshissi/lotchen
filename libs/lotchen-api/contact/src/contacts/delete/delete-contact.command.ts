import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';
import { Injectable, NotFoundException } from '@nestjs/common';

export class DeleteContactCommand {
  @ApiProperty({
    required: true,
    description: 'Contact Id',
    type: String,
  })
  id!: string;
}

@Injectable()
export class DeleteContactCommandHandler
  implements CommandHandler<DeleteContactCommand, void>
{
  constructor(private readonly contactProvider: ContactProvider) {}

  async handlerAsync(command: DeleteContactCommand): Promise<void> {
    const contact = await this.contactProvider.ContactModel.findOne({
      _id: command.id,
      deletedAt: null,
    })
      .lean()
      .exec();

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    await this.contactProvider.ContactModel.findByIdAndUpdate(command.id, {
      $set: {
        deletedAt: new Date(),
        updatedBy: this.contactProvider.user().userId,
        updatedByInfo: this.contactProvider.user(),
      },
    });
  }
}

export class BulkDeleteContactsCommand {
  @ApiProperty({
    required: true,
    description: 'Contact Ids to delete',
    type: [String],
  })
  ids!: string[];
}

@Injectable()
export class BulkDeleteContactsCommandHandler
  implements CommandHandler<BulkDeleteContactsCommand, void>
{
  constructor(private readonly contactProvider: ContactProvider) {}

  async handlerAsync(command: BulkDeleteContactsCommand): Promise<void> {
    await this.contactProvider.ContactModel.updateMany(
      { _id: { $in: command.ids }, deletedAt: null },
      {
        $set: {
          deletedAt: new Date(),
          updatedBy: this.contactProvider.user().userId,
          updatedByInfo: this.contactProvider.user(),
        },
      }
    );
  }
}
