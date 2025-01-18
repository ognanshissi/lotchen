import { ApiProperty } from '@nestjs/swagger';

export class GetAllUserQuery {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'User email ' })
  email!: string;
}
