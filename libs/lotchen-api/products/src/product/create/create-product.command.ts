import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
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
  InsuranceType,
  PaymentFrequency,
} from '../../common/product.enums';

export class ProductFeeDto {
  @ApiProperty() @IsNotEmpty() @IsString() name!: string;
  @ApiProperty() @IsNotEmpty() @IsNumber() amount!: number;
  @ApiProperty() @IsNotEmpty() @IsString() type!: string;
}

export class ProductVariantDto {
  @ApiProperty() @IsNotEmpty() @IsString() name!: string;
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
}

export class PremiumStructureDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  basePremium?: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(PaymentFrequency)
  frequency?: string;
  @ApiProperty({ required: false }) @IsOptional() ageFactors?: Record<
    string,
    number
  >;
}

export class CreateProductCommand {
  @ApiProperty() @IsNotEmpty() @IsString() name!: string;
  @ApiProperty({ enum: ProductType })
  @IsNotEmpty()
  @IsEnum(ProductType)
  type!: string;
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

export class CreateProductCommandResponse {
  @ApiProperty() id!: string;
}

@Injectable()
export class CreateProductCommandHandler
  implements CommandHandler<CreateProductCommand, CreateProductCommandResponse>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(
    command: CreateProductCommand
  ): Promise<CreateProductCommandResponse> {
    const product = new this.productsProvider.ProductModel({
      ...command,
      environment: 'sandbox',
      status: 'draft',
      createdBy: this.productsProvider.user().userId,
      createdByInfo: this.productsProvider.user(),
    });
    await product.save();
    return { id: product._id };
  }
}
