import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactStatus } from '../contact-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  LEAD_CONVERT_TO_PROSPECT_CHANGED,
  LeadConvertToProspectChangedEvent,
} from '@lotchen/lotchen-api/events/contact-status-changed.event';

export class UpdateContactStatusCommandRequest {
  @ApiProperty({
    required: true,
    description: 'New status',
    enum: ContactStatus,
    type: String,
  })
  status!: ContactStatus;
}

export class UpdateContactStatusCommand extends UpdateContactStatusCommandRequest {
  @ApiProperty({ required: true, description: 'Contact Id', type: String })
  id!: string;
}

@Injectable()
export class UpdateContactStatusCommandHandler
  implements CommandHandler<UpdateContactStatusCommand, void>
{
  constructor(
    private readonly contactProvider: ContactProvider,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async handlerAsync(command: UpdateContactStatusCommand): Promise<void> {
    const contact = await this.contactProvider.ContactModel.findOne({
      _id: command.id,
      deletedAt: null,
    })
      .lean()
      .exec();

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    const previousStatus = contact.status;

    // create an event to trigger and update the contact to Prospect type if the status is convertToProspect

    await this.contactProvider.ContactModel.findByIdAndUpdate(command.id, {
      $set: {
        status: command.status,
        updatedBy: this.contactProvider.user().userId,
        updatedByInfo: this.contactProvider.user(),
      },
      $push: {
        statusHistory: {
          previousStatus,
          status: command.status,
          changedAt: new Date(),
          changedBy: this.contactProvider.user().userId,
        },
      },
    });

    if (command.status === ContactStatus.ConvertedToProspect) {
      this.eventEmitter.emit(
        LEAD_CONVERT_TO_PROSPECT_CHANGED,
        new LeadConvertToProspectChangedEvent(command.id)
      );
    }
  }
}
