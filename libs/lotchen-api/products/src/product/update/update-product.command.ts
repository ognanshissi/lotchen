import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommandHandler } from '@lotchen/api/core';
import { ProductsProvider } from '../../products.provider';
import {
  ProductType,
  ProductStatus,
  InsuranceType,
} from '../../common/product.enums';
import {
  ProductFeeDto,
  ProductVariantDto,
  PremiumStructureDto,
} from '../create/create-product.command';

export class UpdateProductCommand {
  id!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false, enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  type?: string;
  @ApiProperty({ required: false, enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  interestRate?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() duration?: number;

  @ApiProperty({ required: false, type: [ProductFeeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFeeDto)
  fees?: ProductFeeDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibilityCriteria?: string[];

  @ApiProperty({ required: false, type: [ProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @ApiProperty({ required: false, enum: InsuranceType })
  @IsOptional()
  @IsEnum(InsuranceType)
  insuranceType?: string;

  @ApiProperty({ required: false, type: PremiumStructureDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PremiumStructureDto)
  premiumStructure?: PremiumStructureDto;

  @ApiProperty({ required: false }) @IsOptional() @IsString() coverage?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  deductible?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() terms?: string;
  @ApiProperty({ required: false }) @IsOptional() metadata?: Record<
    string,
    unknown
  >;
}

@Injectable()
export class UpdateProductCommandHandler
  implements CommandHandler<UpdateProductCommand, void>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(command: UpdateProductCommand): Promise<void> {
    const product = await this.productsProvider.ProductModel.findOne({
      _id: command.id,
      deletedAt: null,
    });
    if (!product) throw new NotFoundException('Produit introuvable');

    const { id, ...updates } = command;
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        (product as never)[key] = value as never;
      }
    });

    product.updatedBy = this.productsProvider.user().userId;
    product.updatedByInfo = this.productsProvider.user();
    await product.save();
  }
}
