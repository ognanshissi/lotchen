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
    );
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (command.firstName) {
      contact.firstName = command.firstName;
    }

    if (command.lastName) {
      contact.lastName = command.lastName;
    }

    if (command.email) {
      contact.email = command.email;
    }

    if (command.mobileNumber) {
      contact.mobileNumber = command.mobileNumber;
    }

    if (command.address) {
      contact.address.street = command.address.street;
      contact.address.city = command.address.city;
      contact.address.postalCode = command.address.postalCode;
      contact.address.country = command.address.country;
      contact.address.state = command.address.state;
      contact.address.isDefaultAddress = command.address.isDefaultAddress;
      contact.address.location = {
        type: 'Point',
        coordinates: command.address.location.coordinates,
      };
    }

    const { firstName, lastName, sub, username } = this._request.user;

    contact.updatedBy = this._request.user.sub;
    contact.updatedByInfo = {
      userId: sub,
      email: username,
      firstName,
      lastName,
    };

    await contact.save();
  }
}
