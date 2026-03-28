import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions, PermissionsAction } from '@lotchen/api/core';
import {
  CreatePolicyCommand,
  CreatePolicyCommandHandler,
  CreatePolicyCommandResponse,
} from './create/create-policy.command';
import {
  FindAllPoliciesQuery,
  FindAllPoliciesQueryHandler,
  FindAllPoliciesQueryResponse,
} from './find-all/find-all-policies.query';
import {
  FindPolicyByIdQueryHandler,
  FindPolicyByIdQueryResponse,
} from './find-by-id/find-policy-by-id.query';
import { UpdatePolicyCommandHandler } from './update/update-policy.command';
import {
  AddClaimCommand,
  AddClaimCommandHandler,
  AddClaimCommandResponse,
} from './add-claim/add-claim.command';
import {
  UpdateClaimCommand,
  UpdateClaimCommandHandler,
} from './update-claim/update-claim.command';

@Controller({ version: '1', path: 'policies' })
@ApiHeader({ name: 'x-tenant-fqn', description: 'The Tenant Fqn' })
@ApiTags('Policies')
export class PolicyController {
  constructor(
    private readonly _createHandler: CreatePolicyCommandHandler,
    private readonly _findAllHandler: FindAllPoliciesQueryHandler,
    private readonly _findByIdHandler: FindPolicyByIdQueryHandler,
    private readonly _updateHandler: UpdatePolicyCommandHandler,
    private readonly _addClaimHandler: AddClaimCommandHandler,
    private readonly _updateClaimHandler: UpdateClaimCommandHandler
  ) {}

  @Post()
  @Permissions(PermissionsAction.productManage)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreatePolicyCommandResponse,
  })
  async create(
    @Body() payload: CreatePolicyCommand
  ): Promise<CreatePolicyCommandResponse> {
    return this._createHandler.handlerAsync(payload);
  }

  @Get()
  @Permissions(PermissionsAction.productManage)
  @ApiResponse({ type: [FindAllPoliciesQueryResponse] })
  async findAll(
    @Query() query: FindAllPoliciesQuery
  ): Promise<FindAllPoliciesQueryResponse[]> {
    return this._findAllHandler.handlerAsync(query);
  }

  @Get(':id')
  @Permissions(PermissionsAction.productManage)
  @ApiResponse({ type: FindPolicyByIdQueryResponse })
  async findById(
    @Param('id') id: string
  ): Promise<FindPolicyByIdQueryResponse> {
    return this._findByIdHandler.handlerAsync({ id });
  }

  @Patch(':id')
  @Permissions(PermissionsAction.productManage)
  async update(
    @Param('id') id: string,
    @Body() payload: Omit<CreatePolicyCommand, 'productId' | 'contactId'>
  ): Promise<void> {
    return this._updateHandler.handlerAsync({ ...payload, id });
  }

  @Post(':id/claims')
  @Permissions(PermissionsAction.productManage)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AddClaimCommandResponse,
  })
  async addClaim(
    @Param('id') policyId: string,
    @Body() payload: Omit<AddClaimCommand, 'policyId'>
  ): Promise<AddClaimCommandResponse> {
    return this._addClaimHandler.handlerAsync({ ...payload, policyId });
  }

  @Patch(':id/claims/:claimId')
  @Permissions(PermissionsAction.productManage)
  async updateClaim(
    @Param('id') policyId: string,
    @Param('claimId') claimId: string,
    @Body() payload: Omit<UpdateClaimCommand, 'policyId' | 'claimId'>
  ): Promise<void> {
    return this._updateClaimHandler.handlerAsync({
      ...payload,
      policyId,
      claimId,
    });
  }
}
