import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllTerritoriesQuery {
  @ApiProperty({
    description: 'Name of the territory',
    type: String,
    required: false,
  })
  name!: string;

  @ApiProperty({
    description: 'Get deleted territories or not',
    type: Boolean,
    default: false,
    required: false,
  })
  isDeleted!: boolean;

  @ApiProperty({
    description:
      'This is a comma separated list, define the properties the api should return',
    example: 'id,name,timestamp,createdByInfo,parent,children',
    default: 'id,name,timestamp,createdByInfo,parent,children',
  })
  fields!: string;

  @ApiProperty({
    maximum: 30,
    minimum: 5,
    example: 5,
    default: 5,
    description: 'Length of records to return',
    type: Number,
  })
  @IsInt()
  @Type(() => Number)
  @Max(30)
  @Min(5)
  public limit!: number;
}

export class TerritoryLiteDto {
  @ApiProperty({ description: 'Id of the territory', type: String })
  id!: string;
  @ApiProperty({ description: 'Name of the territory', type: String })
  name!: string;
}

export class TerritoriesQueryUserDto {
  @ApiProperty({ description: 'User Id', type: String })
  id!: string;
  @ApiProperty({ description: 'Email', type: String })
  email!: string;

  @ApiProperty({
    description: 'User Full name, FirstName and LastName combined',
    type: String,
  })
  fullName!: string;
}

@ApiExtraModels(TerritoryLiteDto, TerritoriesQueryUserDto)
export class FindAllTerritoriesQueryResponse {
  @ApiProperty({ required: true })
  id!: string;

  @ApiProperty({ required: true, description: 'Name of the territory' })
  name!: string;

  @ApiProperty({ description: 'Date of creation', type: Date, required: true })
  createdAt!: Date;

  @ApiProperty({ type: Date, description: 'Latest updated At', required: true })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Person who created the entry',
    type: () => TerritoriesQueryUserDto,
    required: false,
  })
  createdByInfo!: TerritoriesQueryUserDto;

  @ApiProperty({
    type: () => TerritoryLiteDto,
    description: 'Name of the territory parent if so',
    required: false,
  })
  parentInfo!: TerritoryLiteDto;

  @ApiProperty({
    type: 'array',
    items: { $ref: getSchemaPath(TerritoryLiteDto) },
    required: false,
  })
  children!: TerritoryLiteDto[];
}
