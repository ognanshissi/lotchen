import { ApiProperty } from '@nestjs/swagger';

export class CreatedByInfoDto {
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
