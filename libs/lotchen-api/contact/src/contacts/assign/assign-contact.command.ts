import { CommandHandler } from '@lotchen/api/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';
import { Injectable, NotFoundException } from '@nestjs/common';

export class AssignContactCommandRequest {
  @ApiPropertyOptional({ type: String, description: 'Assigned user ID' })
  assignedToUserId?: string;

  @ApiPropertyOptional({ type: String, description: 'Assigned team ID' })
  assignedToTeamId?: string;

  @ApiPropertyOptional({ type: String, description: 'Territory ID' })
  territoryId?: string;

  @ApiPropertyOptional({ type: String, description: 'Agency ID' })
  agencyId?: string;
}

export class AssignContactCommand extends AssignContactCommandRequest {
  @ApiProperty({ required: true, description: 'Contact Id', type: String })
  id!: string;
}

@Injectable()
export class AssignContactCommandHandler
  implements CommandHandler<AssignContactCommand, void>
{
  constructor(private readonly contactProvider: ContactProvider) {}

  async handlerAsync(command: AssignContactCommand): Promise<void> {
    const contact = await this.contactProvider.ContactModel.findOne({
      _id: command.id,
      deletedAt: null,
    })
      .lean()
      .exec();

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    const $set: Record<string, any> = {
      updatedBy: this.contactProvider.user().userId,
      updatedByInfo: this.contactProvider.user(),
    };

    if (command.assignedToUserId !== undefined)
      $set.assignedToUserId = command.assignedToUserId;
    if (command.assignedToTeamId !== undefined)
      $set.assignedToTeamId = command.assignedToTeamId;
    if (command.territoryId !== undefined)
      $set.territoryId = command.territoryId;
    if (command.agencyId !== undefined) $set.agencyId = command.agencyId;

    await this.contactProvider.ContactModel.findByIdAndUpdate(command.id, {
      $set,
    });
  }
}

export class BulkAssignContactsCommandRequest {
  @ApiProperty({
    required: true,
    description: 'Contact Ids to assign',
    type: [String],
  })
  ids!: string[];

  @ApiPropertyOptional({ type: String, description: 'Assigned user ID' })
  assignedToUserId?: string;

  @ApiPropertyOptional({ type: String, description: 'Assigned team ID' })
  assignedToTeamId?: string;

  @ApiPropertyOptional({ type: String, description: 'Territory ID' })
  territoryId?: string;

  @ApiPropertyOptional({ type: String, description: 'Agency ID' })
  agencyId?: string;
}

@Injectable()
export class BulkAssignContactsCommandHandler
  implements CommandHandler<BulkAssignContactsCommandRequest, void>
{
  constructor(private readonly contactProvider: ContactProvider) {}

  async handlerAsync(command: BulkAssignContactsCommandRequest): Promise<void> {
    const $set: Record<string, any> = {
      updatedBy: this.contactProvider.user().userId,
      updatedByInfo: this.contactProvider.user(),
    };

    if (command.assignedToUserId !== undefined)
      $set.assignedToUserId = command.assignedToUserId;
    if (command.assignedToTeamId !== undefined)
      $set.assignedToTeamId = command.assignedToTeamId;
    if (command.territoryId !== undefined)
      $set.territoryId = command.territoryId;
    if (command.agencyId !== undefined) $set.agencyId = command.agencyId;

    await this.contactProvider.ContactModel.updateMany(
      { _id: { $in: command.ids }, deletedAt: null },
      { $set }
    );
  }
}
