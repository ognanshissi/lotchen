import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { QueryHandler } from '@lotchen/api/core';
import { ProductsProvider } from '../../products.provider';

export class FindAllProductsQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  environment?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() type?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() status?: string;
}

export class FindAllProductsQueryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() type!: string;
  @ApiProperty() status!: string;
  @ApiProperty() environment!: string;
  @ApiProperty({ required: false }) description?: string;
  @ApiProperty({ required: false }) interestRate?: number;
  @ApiProperty({ required: false }) duration?: number;
  @ApiProperty({ required: false }) insuranceType?: string;
  @ApiProperty({ required: false }) coverage?: string;
  @ApiProperty({ required: false }) deductible?: number;
  @ApiProperty() testRunCount!: number;
  @ApiProperty({ required: false }) promotedAt?: Date;
  @ApiProperty({ required: false }) promotedBy?: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

@Injectable()
export class FindAllProductsQueryHandler
  implements QueryHandler<FindAllProductsQuery, FindAllProductsQueryResponse[]>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(
    query?: FindAllProductsQuery
  ): Promise<FindAllProductsQueryResponse[]> {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query?.environment) filter['environment'] = query.environment;
    if (query?.type) filter['type'] = query.type;
    if (query?.status) filter['status'] = query.status;

    const products = await this.productsProvider.ProductModel.find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return products.map((p) => ({
      id: p._id,
      name: p.name,
      type: p.type,
      status: p.status,
      environment: p.environment,
      description: p.description,
      interestRate: p.interestRate,
      duration: p.duration,
      insuranceType: p.insuranceType,
      coverage: p.coverage,
      deductible: p.deductible,
      testRunCount: p.testRunCount,
      promotedAt: p.promotedAt,
      promotedBy: p.promotedBy,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }
}
