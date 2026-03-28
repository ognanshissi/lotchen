import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
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
import { PolicyStatus, PaymentFrequency } from '../../common/product.enums';
import { BeneficiaryDto } from '../create/create-policy.command';

export class UpdatePolicyCommand {
  id!: string;
  @ApiProperty({ required: false, enum: PolicyStatus })
  @IsOptional()
  @IsEnum(PolicyStatus)
  status?: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  renewalDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

@Injectable()
export class UpdatePolicyCommandHandler
  implements CommandHandler<UpdatePolicyCommand, void>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(command: UpdatePolicyCommand): Promise<void> {
    const policy = await this.productsProvider.PolicyModel.findOne({
      _id: command.id,
      deletedAt: null,
    });
    if (!policy) throw new NotFoundException('Police introuvable');

    const { id, ...updates } = command;
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        (policy as never)[key] = value as never;
      }
    });

    policy.updatedBy = this.productsProvider.user().userId;
    policy.updatedByInfo = this.productsProvider.user();
    await policy.save();
  }
}
