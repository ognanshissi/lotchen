import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { QueryHandler } from '@lotchen/api/core';
import { ProductsProvider } from '../../products.provider';

export class FindAllPoliciesQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactId?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() status?: string;
}

export class FindAllPoliciesQueryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() policyNumber!: string;
  @ApiProperty() productId!: string;
  @ApiProperty() contactId!: string;
  @ApiProperty() status!: string;
  @ApiProperty({ required: false }) startDate?: Date;
  @ApiProperty({ required: false }) endDate?: Date;
  @ApiProperty({ required: false }) premiumAmount?: number;
  @ApiProperty({ required: false }) paymentFrequency?: string;
  @ApiProperty({ required: false }) renewalDate?: Date;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

@Injectable()
export class FindAllPoliciesQueryHandler
  implements QueryHandler<FindAllPoliciesQuery, FindAllPoliciesQueryResponse[]>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(
    query?: FindAllPoliciesQuery
  ): Promise<FindAllPoliciesQueryResponse[]> {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query?.contactId) filter['contactId'] = query.contactId;
    if (query?.productId) filter['productId'] = query.productId;
    if (query?.status) filter['status'] = query.status;

    const policies = await this.productsProvider.PolicyModel.find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return policies.map((p) => ({
      id: p._id,
      policyNumber: p.policyNumber,
      productId: p.productId,
      contactId: p.contactId,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      premiumAmount: p.premiumAmount,
      paymentFrequency: p.paymentFrequency,
      renewalDate: p.renewalDate,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }
}
