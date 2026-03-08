import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { ContactProvider } from '../contact.provider';
import { Model } from 'mongoose';
import { ContactDocument, contactSource } from '../contact.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CONTACT_CREATED, ContactCreatedEvent } from './contact-created.event';
import { ContactStatus } from '../contact-status.enum';

const VALID_SOURCES: contactSource[] = [
  'Website',
  'Referral',
  'Social Media',
  'Event',
  'Cold Call',
  'Email',
  'Back Office',
  'LinkedIn',
  'Facebook',
  'Twitter',
  'Google',
  'Instagram',
  'YouTube',
  'Pinterest',
  'Snapchat',
  'TikTok',
  'Reddit',
  'Quora',
  'Yelp',
  'Campaign',
  'Other',
];

export class CreateContactCommand {
  @ApiProperty({ required: true, description: 'Email', type: String })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'firstName', type: String, required: true })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: 'LastName', type: String, required: true })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ description: 'Mobile number', type: String, required: true })
  @IsNotEmpty()
  mobileNumber!: string;

  @ApiProperty({ description: 'Date of birth', type: Date, required: false })
  dateOfBirth!: Date;

  @ApiProperty({ description: 'Job title', type: String, required: false })
  jobTitle!: string;

  @ApiProperty({
    description: 'Source of the contact',
    type: String,
    required: false,
    enum: VALID_SOURCES,
  })
  @IsOptional()
  @IsIn(VALID_SOURCES)
  source?: string;

  @ApiProperty({
    description: 'Gender',
    type: String,
    required: false,
    enum: ['Male', 'Female'],
  })
  @IsOptional()
  @IsIn(['Male', 'Female'])
  gender?: string;

  @ApiProperty({
    description: 'Company name',
    type: String,
    required: false,
  })
  companyName?: string;
}

export class CreateContactCommandResponse {
  @ApiProperty({ required: true })
  id!: string;
}

@Injectable()
export class CreateContactCommandHandler
  implements CommandHandler<CreateContactCommand, void>
{
  private readonly _logger = new Logger(CreateContactCommandHandler.name);

  constructor(
    private readonly contactProvider: ContactProvider,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async handlerAsync(command: CreateContactCommand): Promise<void> {
    const existingContact = await this.contactProvider.ContactModel.findOne(
      {
        $or: [
          {
            mobileNumber: command.mobileNumber,
          },
          {
            email: command.email,
          },
        ],
      },
      'id'
    )
      .lean()
      .exec();

    if (existingContact) {
      throw new BadRequestException('Le contact existe déjà !');
    }

    try {
      await this.createContactAsync(this.contactProvider.ContactModel, command);
    } catch (error) {
      this._logger.error(
        `Error while creating contact: errors ${JSON.stringify(error)}`
      );
      throw new BadRequestException('Error while creating contact');
    }
  }

  /**
   *
   * @param contactModel
   * @param command
   */
  private async createContactAsync(
    contactModel: Model<ContactDocument>,
    command: CreateContactCommand
  ): Promise<void> {
    const userId = this.contactProvider.user()?.userId;

    // Look up the creator's user record for team/territory assignment
    let assignedToTeamId: string | undefined;
    let territoryId: string | undefined;

    console.log('userId', userId);

    if (userId) {
      const creator = await this.contactProvider.UserModel.findById(userId)
        .lean()
        .exec();
      if (creator?.teams?.length) {
        assignedToTeamId = (creator.teams[0] as any)._id?.toString();
        territoryId = (creator.teams[0] as any).territoryId?.toString();
      }
    }

    const contact = new contactModel({
      email: command.email,
      firstName: command.firstName,
      lastName: command.lastName,
      mobileNumber: command.mobileNumber,
      dateOfBirth: command.dateOfBirth,
      createdBy: userId,
      createdByInfo: this.contactProvider.user(),
      jobTitle: command.jobTitle,
      source: command.source ?? 'Back Office',
      gender: command.gender ?? null,
      assignedToUserId: userId,
      assignedToTeamId,
      territoryId,
      status: ContactStatus.New,
      companyName: command.companyName,
    });
    contact.validateSync();

    contact.statusHistory.push({
      previousStatus: ContactStatus.New,
      changedAt: new Date(),
      changedBy: userId,
      status: ContactStatus.New,
    });
    await contact.save();

    // Event contact created event
    this.eventEmitter.emit(
      CONTACT_CREATED,
      new ContactCreatedEvent(
        this.contactProvider.request.tenant_fqdn,
        contact.id,
        userId ?? '',
        contact.email,
        contact.mobileNumber,
        ContactStatus.New
      )
    );
  }
}
