import { AddressDto, CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
    description: 'Contact job title',
    type: String,
  })
  jobTitle!: string;

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
  constructor(private readonly contactProvider: ContactProvider) {}

  async handlerAsync(command: UpdateContactCommand): Promise<void> {
    const contact = await this.contactProvider.ContactModel.findById(
      command.id
    ).exec();
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // validate new fields - email must be unique
    const isDuplicated = await this.contactProvider.ContactModel.findOne(
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

    if (isDuplicated?.id !== contact.id) {
      throw new BadRequestException(
        'There is a contact with `email` or `mobile number`'
      );
    }

    await this.contactProvider.ContactModel.findByIdAndUpdate(contact._id, {
      $set: {
        address: command.address,
        email: command.email,
        firstName: command.firstName,
        lastName: command.lastName,
        mobileNumber: command.mobileNumber,
        updatedBy: this.contactProvider.currentUserInfo().userId,
        updatedByInfo: this.contactProvider.currentUserInfo(),
      },
    });
    // await contact.save();
  }
}
