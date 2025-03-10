import {
  AuditUserInfoDto,
  CommandHandler,
  FilterDto,
  filterQueryGenerator,
  Pagination,
  PaginationRequest,
} from '@lotchen/api/core';
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { ContactProvider } from '../contact.provider';

export class FilterAllContactsCommand {
  @ApiProperty({ type: () => FilterDto<string> })
  fullName!: FilterDto<string>;

  @ApiProperty({ type: () => FilterDto<string> })
  email!: FilterDto<string>;
}

@ApiExtraModels(FilterAllContactsCommand)
export class PaginateAllContactsCommand extends PaginationRequest {
  @ApiProperty({
    type: () => FilterAllContactsCommand,
    description: 'Filters for the query',
  })
  filters!: FilterAllContactsCommand;
}

export class PaginateAllContactsCommandDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'Contact email', type: String })
  email!: string;

  @ApiProperty({ description: 'Contact firstName', type: String })
  firstName!: string;

  @ApiProperty({ description: 'Contact lastName', type: String })
  lastName!: string;

  @ApiProperty({ description: 'Contact mobile number', type: String })
  mobileNumber!: string;

  @ApiProperty({ type: () => AuditUserInfoDto })
  createdByInfo!: AuditUserInfoDto | undefined;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

export class PaginateAllContactsCommandResponse extends Pagination<PaginateAllContactsCommandDto> {}

export class PaginateAllContactsCommandHandler
  implements
    CommandHandler<
      PaginateAllContactsCommand,
      PaginateAllContactsCommandResponse
    >
{
  constructor(private readonly contactProvider: ContactProvider) {}
  public async handlerAsync(
    command: PaginateAllContactsCommand
  ): Promise<PaginateAllContactsCommandResponse> {
    const queryFilter = {
      email: filterQueryGenerator(command.filters.email),
      firstName: filterQueryGenerator(command.filters.fullName),
    };

    const totalDocuments =
      await this.contactProvider.ContactModel.countDocuments(
        queryFilter
      ).exec();

    const totalPages = Math.ceil(totalDocuments / command.pageSize);

    const results = await this.contactProvider.ContactModel.aggregate([
      { $match: queryFilter },
      { $skip: Math.max(command.pageIndex * command.pageSize, 0) },
      { $limit: command.pageSize },
      { $sort: { name: 1 } },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          mobileNumber: 1,
          createdAt: 1,
          updatedAt: 1,
          updatedBy: 1,
          createdByInfo: 1,
        },
      },
    ]).exec();

    return {
      pageIndex: command.pageIndex,
      pageSize: command.pageSize,
      totalElements: totalDocuments,
      data: [
        ...results.map((item) => {
          return {
            id: item._id,
            firstName: item.firstName,
            email: item.email,
            mobileNumber: item.mobileNumber,
            lastName: item.lastName,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            createdByInfo: item.createdBy,
          } satisfies PaginateAllContactsCommandDto;
        }),
      ],
      totalPages: totalPages,
    } satisfies PaginateAllContactsCommandResponse;
  }
}
