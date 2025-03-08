import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

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
    example: 'id,name,createdByInfo',
    default: 'id,name,createdByInfo',
  })
  fields!: string;
}

export class TerritoryLightDto {
  @ApiProperty({ description: 'Id of the territory', type: String })
  id!: string;
  @ApiProperty({ description: 'Name of the territory', type: String })
  name!: string;
}

export class TerritoriesQueryUserDto {
  @ApiProperty({ description: 'User Id', type: String })
  id!: string;
  @ApiProperty({ description: 'Email', type: 'string' })
  email!: string;

  @ApiProperty({
    description: 'User Full name, FirstName and LastName combined',
    type: String,
  })
  fullName!: string;
}

@ApiExtraModels(TerritoryLightDto, TerritoriesQueryUserDto)
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
  createdBy!: TerritoriesQueryUserDto;

  @ApiProperty({
    type: () => TerritoryLightDto,
    description: 'Name of the territory parent if so',
    required: false,
  })
  parentInfo!: TerritoryLightDto;

  @ApiProperty({
    type: 'array',
    items: { $ref: getSchemaPath(TerritoryLightDto) },
    required: false,
  })
  children!: TerritoryLightDto[];
}
