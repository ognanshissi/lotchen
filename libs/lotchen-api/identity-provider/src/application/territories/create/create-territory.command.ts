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

  @ApiProperty()
  description!: string;

  @ApiProperty({
    type: [String],
    description: 'Territory children',
    required: false,
  })
  childrenIds!: string[];

  @ApiProperty({ type: String, required: false })
  parentId!: string;
}

@Injectable()
export class CreateTerritoryCommandHandler
  implements CommandHandler<CreateTerritoryCommand, void>
{
  constructor(private readonly territoriesProvider: TerritoriesProvider) {}

  public async handlerAsync(command: CreateTerritoryCommand): Promise<void> {
    try {
      // territory parent
      const parent = await this.territoriesProvider.TerritoryModel.findOne(
        {
          _id: command.parentId,
        },
        '_id'
      );

      // Get children
      const children = await this.territoriesProvider.TerritoryModel.find(
        {
          _id: {
            $in: [...(command.childrenIds ?? [])],
          },
        },
        '_id'
      );

      const territory = new this.territoriesProvider.TerritoryModel({
        name: command.name,
        description: command.description,
        children: command.childrenIds,
        parent: command.parentId,
      });
      await territory.save();
    } catch (error: any) {
      if (error?.errorResponse?.code === 11000) {
        throw new BadRequestException(
          `There is a territory with name '${command.name}'`
        );
      } else {
        throw new BadRequestException(error);
      }
    }
  }
}
