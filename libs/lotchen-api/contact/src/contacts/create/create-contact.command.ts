import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ContactProvider } from '../contact.provider';
import { Model } from 'mongoose';
import { ContactDocument } from '../contact.schema';

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
  constructor(private readonly contactProvider: ContactProvider) {}

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
      console.log(error);
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
    });
    contact.validateSync();
    await contact.save(); // save the contact
  }
}
