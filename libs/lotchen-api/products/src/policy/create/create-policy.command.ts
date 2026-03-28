import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommandHandler } from '@lotchen/api/core';
import { ProductsProvider } from '../../products.provider';
import {
  PaymentFrequency,
  ProductStatus,
  Environment,
} from '../../common/product.enums';

export class BeneficiaryDto {
  @ApiProperty() @IsNotEmpty() @IsString() name!: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  relationship?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  percentage?: number;
}

export class CreatePolicyCommand {
  @ApiProperty() @IsNotEmpty() @IsString() productId!: string;
  @ApiProperty() @IsNotEmpty() @IsString() contactId!: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  premiumAmount?: number;
  @ApiProperty({ required: false, enum: PaymentFrequency })
  @IsOptional()
  @IsEnum(PaymentFrequency)
  paymentFrequency?: string;

  @ApiProperty({ required: false, type: [BeneficiaryDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BeneficiaryDto)
  beneficiaries?: BeneficiaryDto[];

  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class CreatePolicyCommandResponse {
  @ApiProperty() id!: string;
  @ApiProperty() policyNumber!: string;
}

function generatePolicyNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `POL-${date}-${random}`;
}

@Injectable()
export class CreatePolicyCommandHandler
  implements CommandHandler<CreatePolicyCommand, CreatePolicyCommandResponse>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(
    command: CreatePolicyCommand
  ): Promise<CreatePolicyCommandResponse> {
    const product = await this.productsProvider.ProductModel.findOne({
      _id: command.productId,
      deletedAt: null,
    }).lean();

    if (!product) throw new NotFoundException('Produit introuvable');

    if (product.status !== ProductStatus.Active) {
      throw new BadRequestException('Le produit doit être actif');
    }

    if (product.environment !== Environment.Production) {
      throw new BadRequestException(
        'Le produit doit être en environnement de production'
      );
    }

    const policyNumber = generatePolicyNumber();

    const policy = new this.productsProvider.PolicyModel({
      ...command,
      policyNumber,
      status: 'quote',
      createdBy: this.productsProvider.user().userId,
      createdByInfo: this.productsProvider.user(),
    });
    await policy.save();

    return { id: policy._id, policyNumber };
  }
}
