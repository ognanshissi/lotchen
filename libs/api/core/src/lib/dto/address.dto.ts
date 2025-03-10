import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({
    required: false,
    description: 'Type',
    default: 'Point',
    type: String,
  })
  type!: string;
  @ApiProperty({
    required: false,
    description: 'Coordinates [longitude, latitude]',
    type: [Number],
    example: '[7.5455112, -5.547545]',
  })
  coordinates!: [number];
}

export class AddressDto {
  @ApiProperty({
    required: false,
    description: 'Street',
    type: String,
  })
  street!: string;

  @ApiProperty({
    required: false,
    description: 'City',
    type: String,
  })
  city!: string;

  @ApiProperty({
    required: false,
    description: 'State',
    type: String,
  })
  state!: string;

  @ApiProperty({
    required: false,
    description: 'Zip code',
    type: String,
  })
  postalCode!: string;

  @ApiProperty({
    required: false,
    description: 'Country',
    type: String,
  })
  country!: string;

  @ApiProperty({
    required: false,
    description: 'Is default address',
    type: Boolean,
  })
  isDefaultAddress!: boolean;

  @ApiProperty({
    required: false,
    description: 'Location',
    type: () => LocationDto,
  })
  location!: LocationDto;
}
