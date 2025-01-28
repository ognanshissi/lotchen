import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { AgenciesProvider } from '../agencies.provider';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TerritoriesProvider } from '../../territories/territories.provider';

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
  coordinates!: [number];

  @ApiProperty({ type: String, required: false })
  postalCode?: string;
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

@Injectable()
export class CreateAgencyCommandHandler
  implements CommandHandler<CreateAgencyCommand, void>
{
  constructor(
    private readonly agenciesProvider: AgenciesProvider,
    private readonly territoriesProvider: TerritoriesProvider
  ) {}

  public async handlerAsync(command: CreateAgencyCommand): Promise<void> {
    try {
      const territory = await this.territoriesProvider.TerritoryModel.findOne({
        _id: command.territoryId,
      }).exec();

      if (!territory) {
        throw new BadRequestException('Territory not found !');
      }

      const agency = new this.agenciesProvider.AgencyModel({
        name: command.name,
        territory: command.territoryId,
        address: {
          street: command?.address?.street,
          city: command?.address?.city,
          postalCode: command?.address?.postalCode,
          location: {
            type: 'Point',
            coordinates: command?.address?.coordinates,
          },
        },
      });

      const validationError = agency.validateSync();

      if (validationError) {
        throw new BadRequestException(validationError.errors);
      }

      await agency.save();

      // update agencies path on territory
      territory.agencies.push(agency.id);
      await territory.save();
    } catch (error: any) {
      if (error?.errorResponse?.code === 11000) {
        throw new BadRequestException(
          `Agency with name '${command.name}' already exist !`
        );
      } else {
        throw new BadRequestException(error);
      }
    }
  }
}
