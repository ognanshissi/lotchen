import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommandHandler, RequestExtendedWithUser } from '@lotchen/api/core';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { TerritoriesProvider } from '../territories.provider';
import { REQUEST } from '@nestjs/core';
import { TerritoriesErrors } from '../territories-errors';

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
  constructor(
    private readonly territoriesProvider: TerritoriesProvider,
    @Inject(REQUEST)
    private readonly request: RequestExtendedWithUser
  ) {}

  public async handlerAsync(command: CreateTerritoryCommand): Promise<void> {
    try {
      const existTerritory =
        await this.territoriesProvider.TerritoryModel.findOne(
          { name: command.name },
          '_id name'
        )
          .lean()
          .exec();

      if (existTerritory) {
        throw new BadRequestException(
          TerritoriesErrors.territoryAlreadyExist(command.name)
        );
      }

      // territory parent
      const parent = await this.territoriesProvider.TerritoryModel.findOne(
        {
          _id: command.parentId,
        },
        '_id name'
      )
        .lean()
        .exec();

      const { firstName, lastName, username, sub } = this.request.user;

      const territory = new this.territoriesProvider.TerritoryModel({
        name: command.name,
        description: command.description,
        parent: parent?._id ?? null,
        parentName: parent?.name ?? null,
        createdBy: sub,
        createdByInfo: {
          userId: sub,
          firstName,
          lastName,
          email: username,
        },
      });
      // Update all children territory parent property
      if (command.childrenIds.length) {
        for (const territoryId of command.childrenIds) {
          await this.territoriesProvider.TerritoryModel.findOneAndUpdate(
            { _id: territoryId },
            { parent: territory._id }
          );
        }
      }
      await territory.save();
    } catch (error: any) {
      console.log(error);
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
