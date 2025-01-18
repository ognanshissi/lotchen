import { ApiProperty } from '@nestjs/swagger';

export class CreateUserCommand {
  @ApiProperty({ required: true })
  email!: string;

  @ApiProperty()
  password!: string;

  @ApiProperty()
  confirmPassword!: string;
}
