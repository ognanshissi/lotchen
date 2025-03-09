import { ApiProperty } from '@nestjs/swagger';

export class CreateUserCommand {
  @ApiProperty({ required: true })
  email!: string;

  @ApiProperty()
  password!: string;

  @ApiProperty()
  confirmPassword!: string;

  @ApiProperty({ description: 'firstName', type: String, required: true })
  firstName!: string;

  @ApiProperty({ description: 'LastName', type: String, required: true })
  lastName!: string;

  @ApiProperty({ description: 'Mobile number', type: String, required: true })
  mobileNumber!: string;

  @ApiProperty({ description: 'Date of birth', type: Date, required: false })
  dateOfBirth!: Date;
}
