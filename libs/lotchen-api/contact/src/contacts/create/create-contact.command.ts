import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ContactProvider } from '../contact.provider';
import { Model } from 'mongoose';
import { ContactDocument } from '../contact.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CONTACT_CREATED, ContactCreatedEvent } from './contact-created.event';
import { ContactStatus } from '../contact-status.enum';

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
    const contact = new contactModel({
      email: command.email,
      firstName: command.firstName,
      lastName: command.lastName,
      mobileNumber: command.mobileNumber,
      dateOfBirth: command.dateOfBirth,
      createdBy: this.contactProvider.currentUserInfo()?.userId,
      createdByInfo: this.contactProvider.currentUserInfo(),
      jobTitle: command.jobTitle,
      assignedToUserId: this.contactProvider.currentUserInfo()?.userId,
      status: ContactStatus.New,
    });
    contact.validateSync();

    // contact.statusHistory.push({
    //   previousStatus: ContactStatus.New,
    //   changedAt: new Date(),
    //   changedBy: this.contactProvider.currentUserInfo()?.userId,
    //   status: ContactStatus.New,
    // });
    await contact.save(); // save the contact

    // Event contact created event
    this.eventEmitter.emit(
      CONTACT_CREATED,
      new ContactCreatedEvent(
        this.contactProvider.request.tenant_fqdn,
        contact.id,
        this.contactProvider.currentUserInfo()?.userId ?? '',
        contact.email,
        contact.mobileNumber,
        ContactStatus.New
      )
    );
  }
}
