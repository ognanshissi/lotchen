import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { LeadProvider } from '../lead.provider';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactTypeEnum } from '../../contacts/contact.schema';
import { ContactStatus } from '../../contacts/contact-status.enum';
import { IsIn, IsNotEmpty } from 'class-validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LEAD_STATUS_CHANGED } from '../qualify/qualify-lead.command';

export class ConvertLeadCommandRequest {
  @ApiProperty({
    required: true,
    type: String,
    enum: ['prospect', 'client'],
    description: 'Convert lead to prospect or client',
  })
  @IsNotEmpty()
  @IsIn(['prospect', 'client'])
  convertTo!: 'prospect' | 'client';
}

export class ConvertLeadCommand extends ConvertLeadCommandRequest {
  @ApiProperty({ required: true, type: String })
  id!: string;
}

@Injectable()
export class ConvertLeadCommandHandler
  implements CommandHandler<ConvertLeadCommand, void>
{
  constructor(
    private readonly leadProvider: LeadProvider,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async handlerAsync(command: ConvertLeadCommand): Promise<void> {
    const lead = await this.leadProvider.ContactModel.findOne({
      _id: command.id,
      type: ContactTypeEnum.Lead,
      deletedAt: null,
    }).lean();

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const previousStatus = lead.status;

    const $set: Record<string, any> = {
      type: ContactTypeEnum.Prospect,
      updatedBy: this.leadProvider.user().userId,
      updatedByInfo: this.leadProvider.user(),
    };

    if (command.convertTo === 'prospect') {
      $set.status = ContactStatus.ConvertedToProspect;
    } else {
      $set.status = ContactStatus.ConvertedToClient;
      $set.isConvertedToClientAt = new Date();
    }

    await this.leadProvider.ContactModel.findByIdAndUpdate(command.id, {
      $set,
      $push: {
        statusHistory: {
          previousStatus,
          status: $set.status,
          changedAt: new Date(),
          changedBy: this.leadProvider.user().userId,
        },
      },
    });

    this.eventEmitter.emit(LEAD_STATUS_CHANGED, {
      tenantId: this.leadProvider.request.tenant_fqdn,
      contactId: command.id,
      previousStatus,
      newStatus: $set.status,
      changedByUserId: this.leadProvider.user().userId,
    });
  }
}
