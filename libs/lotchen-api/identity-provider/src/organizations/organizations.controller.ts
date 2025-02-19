import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateOrganizationCommand,
  CreateOrganizationCommandHandler,
} from './create/create-organization.command';
import {
  FindAllOrganizationQueryHandler,
  FindAllOrganizationQueryResponse,
} from './find-all/find-all-organization.query';

@Controller({
  version: '1',
  path: 'organizations',
})
@ApiHeader({
  name: 'x-tenant-fqdn',
  description: 'The Tenant Fqdn',
})
@ApiTags('Organizations')
export class OrganizationsController {
  constructor(
    private readonly createOrganizationCommandHandler: CreateOrganizationCommandHandler,
    private readonly findAllOrganizationQueryHandler: FindAllOrganizationQueryHandler
  ) {}

  @Get()
  @ApiResponse({
    type: [FindAllOrganizationQueryResponse],
  })
  public async findAllOrganizations(): Promise<
    FindAllOrganizationQueryResponse[]
  > {
    return await this.findAllOrganizationQueryHandler.handlerAsync();
  }

  @Post()
  @ApiResponse({ type: String })
  public async createOrganization(
    @Body() request: CreateOrganizationCommand
  ): Promise<string> {
    return await this.createOrganizationCommandHandler.handlerAsync(request);
  }
}
