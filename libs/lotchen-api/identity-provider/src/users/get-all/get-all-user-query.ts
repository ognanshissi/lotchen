import { ApiProperty } from '@nestjs/swagger';

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
}
