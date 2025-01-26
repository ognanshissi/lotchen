import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TerritoriesProvider } from '../territories.provider';

export class CreateTerritoryCommand {
  @ApiProperty({
    type: String,
    description: 'Name of the territory',
    example: 'Ivory Coast',
  })
  @IsNotEmpty({ message: 'Nom est obligatoire' })
  name!: string;

  @ApiProperty({
    type: [Number],
    required: false,
    description:
      'Coordinates of the territory, probably a known country such as Ivory Coast',
    example: '[7.5455112, -5.547545]',
  })
  coordinates!: [number];
}

@Injectable()
export class CreateTerritoryCommandHandler
  implements CommandHandler<CreateTerritoryCommand, void>
{
  constructor(private readonly territoriesProvider: TerritoriesProvider) {}

  public async handlerAsync(command: CreateTerritoryCommand): Promise<void> {
    const territory = new this.territoriesProvider.TerritoryModel({
      name: command.name,
      location: {
        type: 'Point',
        coordinates: command?.coordinates,
      },
    });

    const errors = territory.validateSync();

    if (errors) {
      throw new BadRequestException(errors.errors);
    }
    await territory.save();
  }
}
