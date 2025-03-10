import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserCommand {
  @ApiProperty({ required: true, description: 'Email', type: String })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Password', type: String, required: true })
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    description: 'Confirm password',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  confirmPassword!: string;

  @ApiProperty({ description: 'firstName', type: String, required: true })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: 'LastName', type: String, required: true })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ description: 'Mobile number', type: String, required: true })
  @IsNotEmpty()
  mobileNumber!: string;

  @ApiProperty({ description: 'Date of birth', type: Date, required: false })
  dateOfBirth!: Date;
}
