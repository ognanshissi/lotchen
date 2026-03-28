import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { ProductsProvider } from '../../products.provider';

export class FindProductByIdQuery {
  id!: string;
}

export class FindProductByIdQueryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() type!: string;
  @ApiProperty() status!: string;
  @ApiProperty() environment!: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ required: false }) interestRate?: number;
  @ApiProperty({ required: false }) duration?: number;
  @ApiProperty({ required: false }) fees?: unknown[];
  @ApiProperty({ required: false }) eligibilityCriteria?: string[];
  @ApiProperty({ required: false }) variants?: unknown[];
  @ApiProperty({ required: false }) insuranceType?: string;
  @ApiProperty({ required: false }) premiumStructure?: unknown;
  @ApiProperty({ required: false }) coverage?: string;
  @ApiProperty({ required: false }) deductible?: number;
  @ApiProperty({ required: false }) terms?: string;
  @ApiProperty({ required: false }) metadata?: Record<string, unknown>;
  @ApiProperty() testRunCount!: number;
  @ApiProperty({ required: false }) promotedAt?: Date;
  @ApiProperty({ required: false }) promotedBy?: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

@Injectable()
export class FindProductByIdQueryHandler
  implements QueryHandler<FindProductByIdQuery, FindProductByIdQueryResponse>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(
    query: FindProductByIdQuery
  ): Promise<FindProductByIdQueryResponse> {
    const product = await this.productsProvider.ProductModel.findOne({
      _id: query.id,
      deletedAt: null,
    }).lean();

    if (!product) throw new NotFoundException('Produit introuvable');

    return {
      id: product._id,
      name: product.name,
      type: product.type,
      status: product.status,
      environment: product.environment,
      description: product.description,
      interestRate: product.interestRate,
      duration: product.duration,
      fees: product.fees,
      eligibilityCriteria: product.eligibilityCriteria,
      variants: product.variants,
      insuranceType: product.insuranceType,
      premiumStructure: product.premiumStructure,
      coverage: product.coverage,
      deductible: product.deductible,
      terms: product.terms,
      metadata: product.metadata,
      testRunCount: product.testRunCount,
      promotedAt: product.promotedAt,
      promotedBy: product.promotedBy,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
