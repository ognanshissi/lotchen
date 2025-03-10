import { CommandHandler, RequestExtendedWithUser } from '@lotchen/api/core';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ContactProvider } from '../contact.provider';
import { Model } from 'mongoose';
import { ContactDocument } from '../contact.schema';
import { REQUEST } from '@nestjs/core';

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
}

export class CreateContactCommandResponse {
  @ApiProperty({ required: true })
  id!: string;
}

@Injectable()
export class CreateContactCommandHandler
  implements CommandHandler<CreateContactCommand, void>
{
  constructor(
    private readonly contactProvider: ContactProvider,
    @Inject(REQUEST) private readonly _request: RequestExtendedWithUser
  ) {}
  async handlerAsync(command: CreateContactCommand): Promise<void> {
    try {
      await this.createContactAsync(this.contactProvider.ContactModel, command);
    } catch (error) {
      throw new BadRequestException('Error while creating contact');
    }
  }

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
    });
    contact.validateSync();
    await contact.save(); // save the contact
  }
}
