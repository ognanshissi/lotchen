import { ApiProperty } from '@nestjs/swagger';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler } from '@lotchen/api/core';
import { OrganizationsProvider } from '../organizations.provider';

export class CreateOrganizationCommand {
  @ApiProperty({
    type: String,
    description: 'Name of the organization (Subsidiary)',
  })
  name!: string;

  @ApiProperty({
    type: String,
    description:
      'Description of the organization, scope and country where is located',
  })
  description!: string;
}

@Injectable()
export class CreateOrganizationCommandHandler
  implements CommandHandler<CreateOrganizationCommand, string>
{
  constructor(private readonly _organizationProvider: OrganizationsProvider) {}

  public async handlerAsync(
    command: CreateOrganizationCommand
  ): Promise<string> {
    const existingOrg =
      await this._organizationProvider.OrganizationModel.findOne(
        { name: command.name },
        'name'
      );

    if (existingOrg) {
      throw new BadRequestException(
        'Organization already exist, try another name.'
      );
    }

    const newOrganization = new this._organizationProvider.OrganizationModel({
      name: command.name,
      description: command.description,
    });

    await newOrganization.save();

    return newOrganization._id;
  }
}
