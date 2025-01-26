import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { AgenciesProvider } from '../agencies.provider';
import { BadRequestException } from '@nestjs/common';

export class CreateAgencyAddressDto {
  @ApiProperty({
    description: 'Street',
    example: 'Avenue Fadiga',
  })
  street!: string;

  @ApiProperty({
    description: 'City',
    example: 'Abidjan',
  })
  city!: string;

  @ApiProperty({
    type: [Number],
    required: false,
    description:
      'Coordinates of the place (Office), probably a known country such as Ivory Coast',
    example: '[7.5455112, -5.547545]',
  })
  location!: [number];
}

export class CreateAgencyCommand {
  @ApiProperty({
    description: 'Territory ID, the territory where the office will be linked',
    required: true,
    type: String,
  })
  @IsNotEmpty({ message: "L'identifiant du territoire est obligatoire" })
  territoryId!: string;

  @ApiProperty({
    description: 'Agency name',
    type: String,
    required: true,
    example: 'Agence de Plateau',
  })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  name!: string;

  @ApiProperty({
    type: () => CreateAgencyAddressDto,
  })
  address!: CreateAgencyAddressDto;
}

export class CreateAgencyCommandHandler
  implements CommandHandler<CreateAgencyCommand, void>
{
  constructor(private readonly agenciesProvider: AgenciesProvider) {}

  public async handlerAsync(command: CreateAgencyCommand): Promise<void> {
    const agency = new this.agenciesProvider.AgencyModel({
      name: command.name,
      territory: command.territoryId,
      address: {
        street: command?.address?.street,
        city: command?.address?.city,
        location: {
          type: 'Point',
          coordinates: command?.address?.location,
        },
      },
    });

    const validationErrors = agency.validateSync();

    if (validationErrors) {
      throw new BadRequestException(validationErrors.errors);
    }

    await agency.save();
  }
}
