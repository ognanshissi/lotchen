import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { LeadProvider } from '../lead.provider';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactTypeEnum } from '../../contacts/contact.schema';
import { ContactStatus } from '../../contacts/contact-status.enum';
import { IsNotEmpty, IsString } from 'class-validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LEAD_STATUS_CHANGED } from '../qualify/qualify-lead.command';

export class DisqualifyLeadCommandRequest {
  @ApiProperty({
    required: true,
    type: String,
    description: 'Reason for disqualification',
  })
  @IsNotEmpty()
  @IsString()
  reason!: string;
}

export class DisqualifyLeadCommand extends DisqualifyLeadCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class DisqualifyLeadCommandHandler
  implements CommandHandler<DisqualifyLeadCommand, void>
{
  constructor(
    private readonly leadProvider: LeadProvider,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async handlerAsync(command: DisqualifyLeadCommand): Promise<void> {
    const lead = await this.leadProvider.ContactModel.findOne({
      _id: command.id,
      type: ContactTypeEnum.Lead,
      deletedAt: null,
    }).lean();

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const previousStatus = lead.status;

    await this.leadProvider.ContactModel.findByIdAndUpdate(command.id, {
      $set: {
        status: ContactStatus.Disqualified,
        'customFields.disqualificationReason': command.reason,
        updatedBy: this.leadProvider.user().userId,
        updatedByInfo: this.leadProvider.user(),
      },
      $push: {
        statusHistory: {
          previousStatus,
          status: ContactStatus.Disqualified,
          changedAt: new Date(),
          changedBy: this.leadProvider.user().userId,
        },
      },
    });

    this.eventEmitter.emit(LEAD_STATUS_CHANGED, {
      tenantId: this.leadProvider.request.tenant_fqdn,
      contactId: command.id,
      previousStatus,
      newStatus: ContactStatus.Disqualified,
      changedByUserId: this.leadProvider.user().userId,
    });
  }
}
