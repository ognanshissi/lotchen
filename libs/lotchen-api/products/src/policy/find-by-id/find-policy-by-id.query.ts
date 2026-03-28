import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { ProductsProvider } from '../../products.provider';

export class FindPolicyByIdQuery {
  id!: string;
}

export class FindPolicyByIdQueryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() policyNumber!: string;
  @ApiProperty() productId!: string;
  @ApiProperty() contactId!: string;
  @ApiProperty() status!: string;
  @ApiProperty({ required: false }) startDate?: Date;
  @ApiProperty({ required: false }) endDate?: Date;
  @ApiProperty({ required: false }) premiumAmount?: number;
  @ApiProperty({ required: false }) paymentFrequency?: string;
  @ApiProperty({ required: false }) beneficiaries?: unknown[];
  @ApiProperty({ required: false }) claims?: unknown[];
  @ApiProperty({ required: false }) renewalDate?: Date;
  @ApiProperty({ required: false }) notes?: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

@Injectable()
export class FindPolicyByIdQueryHandler
  implements QueryHandler<FindPolicyByIdQuery, FindPolicyByIdQueryResponse>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(
    query: FindPolicyByIdQuery
  ): Promise<FindPolicyByIdQueryResponse> {
    const policy = await this.productsProvider.PolicyModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!policy) throw new NotFoundException('Police introuvable');

    return {
      id: policy._id,
      policyNumber: policy.policyNumber,
      productId: policy.productId,
      contactId: policy.contactId,
      status: policy.status,
      startDate: policy.startDate,
      endDate: policy.endDate,
      premiumAmount: policy.premiumAmount,
      paymentFrequency: policy.paymentFrequency,
      beneficiaries: policy.beneficiaries,
      claims: policy.claims,
      renewalDate: policy.renewalDate,
      notes: policy.notes,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
    };
  }
}
