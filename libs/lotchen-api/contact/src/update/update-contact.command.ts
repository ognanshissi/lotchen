import {
  AddressDto,
  CommandHandler,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';
import { Inject, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

export class UpdateContactCommandRequest {
  @ApiProperty({
    required: false,
    description: 'Contact firstName',
    type: String,
  })
  firstName!: string;

  @ApiProperty({
    required: false,
    description: 'Contact lastName',
    type: String,
  })
  lastName!: string;

  @ApiProperty({
    required: false,
    description: 'Contact Email',
    type: String,
  })
  email!: string;

  @ApiProperty({
    required: false,
    description: 'Contact mobileNumber',
    type: String,
  })
  mobileNumber!: string;

  @ApiProperty({
    required: false,
    description: 'Contact Address',
    type: () => AddressDto,
  })
  address!: AddressDto;
}

export class UpdateContactCommand extends UpdateContactCommandRequest {
  @ApiProperty({
    required: false,
    description: 'Contact Id',
    type: String,
  })
  id!: string;
}

export class UpdateContactCommandHandler
  implements CommandHandler<UpdateContactCommand, void>
{
  constructor(
    private readonly contactProvider: ContactProvider,
    @Inject(REQUEST) private readonly _request: RequestExtendedWithUser
  ) {}

  async handlerAsync(command: UpdateContactCommand): Promise<void> {
    const contact = await this.contactProvider.ContactModel.findById(
      command.id
    ).exec();
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // validate new fields - email must be unique

    // Update audit fields
    const { firstName, lastName, sub, username } = this._request.user;

    const updatedByInfo = {
      userId: sub,
      email: username,
      firstName,
      lastName,
    };

    await this.contactProvider.ContactModel.findByIdAndUpdate(contact._id, {
      $set: {
        address: command.address,
        email: command.email,
        firstName: command.firstName,
        lastName: command.lastName,
        mobileNumber: command.mobileNumber,
        updatedBy: sub,
        updatedByInfo,
      },
      new: true,
    });
    // await contact.save();
  }
}
