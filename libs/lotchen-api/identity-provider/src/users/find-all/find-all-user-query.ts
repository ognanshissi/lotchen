import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { AuditUserInfoDto } from '@lotchen/api/core';

export class FindAllUserQuery {
  @ApiProperty({
    description: 'Fields to return',
    type: String,
    required: false,
  })
  fields!: string;

  @ApiProperty({
    description: 'Filter by email',
    type: String,
    required: false,
  })
  email!: string;

  @ApiProperty({
    description: 'Filter by fullName, FirstName or LastName',
    type: String,
    required: false,
  })
  fullName!: string;

  // @ApiProperty({ description: "Filter by roleName", type: String, required: false})
  // role!: string;

  @ApiProperty({
    description: 'Filter by deleted records',
    type: Boolean,
    required: false,
  })
  isDeleted!: boolean;
}

@ApiExtraModels(AuditUserInfoDto)
export class FindAllUserQueryResponse {
  @ApiProperty({ description: 'User id, use `id` for dynamic field querying' })
  userId!: string;

  @ApiProperty({
    description:
      'User email, use `contactInfo` for dynamic field querying if you want email in response',
  })
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
    type: () => AuditUserInfoDto,
    description: 'Information of the owner of the record',
  })
  createdByInfo!: AuditUserInfoDto;
}
