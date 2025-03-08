import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { CreatedByInfoDto } from '@lotchen/api/core';

@ApiExtraModels(CreatedByInfoDto)
export class GetAllUserQuery {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ description: 'User email ' })
  email!: string;

  @ApiProperty({ type: String })
  firstName!: string;

  @ApiProperty({ type: String })
  lastName!: string;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;

  @ApiProperty({
    type: () => CreatedByInfoDto,
    description: 'Information of the owner of the record',
  })
  createdByInfo!: CreatedByInfoDto;
}
