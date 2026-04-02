import { AddressDto, CommandHandler } from '@lotchen/api/core';
import { ApiProperty } from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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
    description: 'Contact gender',
    type: String,
  })
  gender!: string;

  @ApiProperty({
    required: false,
    description: 'Contact phone (landline)',
    type: String,
  })
  phone!: string;

  @ApiProperty({
    required: false,
    description: 'Contact date of birth',
    type: Date,
  })
  dateOfBirth!: Date;

  @ApiProperty({
    required: false,
    description: 'Contact company name',
    type: String,
  })
  companyName!: string;

  @ApiProperty({
    required: false,
    description: 'Contact tags',
    type: [String],
  })
  tags!: string[];

  @ApiProperty({
    required: false,
    description: 'Contact source',
    type: String,
  })
  source!: string;

  @ApiProperty({
    required: false,
    description: 'Contact Address',
    type: () => AddressDto,
  })
  address!: AddressDto;

  @ApiProperty({
    required: false,
    description: 'Contact custom fields',
    type: Object,
  })
  customFields?: Record<string, any>;
}

export class UpdateContactCommand extends UpdateContactCommandRequest {
  @ApiProperty({
    required: false,
    description: 'Contact Id',
    type: String,
  })
  id!: string;
}

@Injectable()
export class UpdateContactCommandHandler
  implements CommandHandler<UpdateContactCommand, void>
{
  constructor(private readonly contactProvider: ContactProvider) {}

  async handlerAsync(command: UpdateContactCommand): Promise<void> {
    const contact = await this.contactProvider.ContactModel.exists({
      _id: command.id,
    })
      .lean()
      .exec();
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // validate new fields - email must be unique
    const dupeFilters = [];
    if (command.email) dupeFilters.push({ email: command.email });
    if (command.mobileNumber)
      dupeFilters.push({ mobileNumber: command.mobileNumber });

    if (dupeFilters.length > 0) {
      const isDuplicated = await this.contactProvider.ContactModel.findOne(
        { $or: dupeFilters },
        '_id'
      )
        .lean()
        .exec();

      if (
        isDuplicated &&
        isDuplicated._id.toString() !== contact._id.toString()
      ) {
        throw new BadRequestException(
          'Un contact avec cet email ou numero de telephone existe déjà'
        );
      }
    }

    const $set: Record<string, any> = {
      updatedBy: this.contactProvider.user().userId,
      updatedByInfo: this.contactProvider.user(),
      ...command,
    };

    if (command.customFields !== undefined) {
      for (const [key, value] of Object.entries(command['customFields'])) {
        $set[`customFields.${key}`] = value;
      }
    }

    await this.contactProvider.ContactModel.findByIdAndUpdate(contact._id, {
      $set,
    });
    // await contact.save();
  }
}
