import { ApiProperty } from '@nestjs/swagger';

export class AuditUserInfoDto {
  @ApiProperty({ description: 'User Id', type: String })
  id!: string;
  @ApiProperty({ description: 'Email', type: String, required: false })
  email!: string;
  @ApiProperty({ description: 'FirstName', type: String, required: false })
  firstName!: string;
  @ApiProperty({ description: 'LastName', type: String, required: false })
  lastName!: string;
}
