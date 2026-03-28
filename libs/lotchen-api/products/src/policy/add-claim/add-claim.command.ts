import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { ProductsProvider } from '../../products.provider';

export class AddClaimCommand {
  policyId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() amount?: number;
  @ApiProperty() @IsNotEmpty() @IsString() description!: string;
}

export class AddClaimCommandResponse {
  @ApiProperty() claimNumber!: string;
}

function generateClaimNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CLM-${date}-${random}`;
}

@Injectable()
export class AddClaimCommandHandler
  implements CommandHandler<AddClaimCommand, AddClaimCommandResponse>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(
    command: AddClaimCommand
  ): Promise<AddClaimCommandResponse> {
    const policy = await this.productsProvider.PolicyModel.findOne({
      _id: command.policyId,
      deletedAt: null,
    });
    if (!policy) throw new NotFoundException('Police introuvable');

    const claimNumber = generateClaimNumber();

    policy.claims.push({
      claimNumber,
      status: 'open',
      amount: command.amount,
      description: command.description,
      filedAt: new Date(),
    } as never);

    policy.updatedBy = this.productsProvider.user().userId;
    policy.updatedByInfo = this.productsProvider.user();
    await policy.save();

    return { claimNumber };
  }
}
