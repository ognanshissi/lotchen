import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TerritoriesService } from '../services/territories.service';

export class CreateTerritoryDto {
  @ApiProperty({
    type: String,
    description: 'Name of the territory',
    example: 'Ivory Coast',
  })
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

@Controller({
  version: '1',
  path: 'territories',
})
@ApiTags('Territories')
export class TerritoriesController {
  constructor(private readonly _territoriesService: TerritoriesService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post()
  async create(@Body() payload: CreateTerritoryDto): Promise<void> {
    return this._territoriesService.createAsync(payload);
  }
}
