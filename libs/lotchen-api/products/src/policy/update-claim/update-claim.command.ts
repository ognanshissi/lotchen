import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { ProductsProvider } from '../../products.provider';
import { ClaimStatus } from '../../common/product.enums';

export class UpdateClaimCommand {
  policyId!: string;
  claimId!: string;
  @ApiProperty({ required: false, enum: ClaimStatus })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsNumber() amount?: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

@Injectable()
export class UpdateClaimCommandHandler
  implements CommandHandler<UpdateClaimCommand, void>
{
  constructor(private readonly productsProvider: ProductsProvider) {}

  async handlerAsync(command: UpdateClaimCommand): Promise<void> {
    const policy = await this.productsProvider.PolicyModel.findOne({
      _id: command.policyId,
      deletedAt: null,
    });
    if (!policy) throw new NotFoundException('Police introuvable');

    const claim = policy.claims.find((c) => c.claimNumber === command.claimId);
    if (!claim) throw new NotFoundException('Réclamation introuvable');

    if (command.status) claim.status = command.status;
    if (command.amount !== undefined) claim.amount = command.amount;
    if (command.description) claim.description = command.description;

    if (
      command.status === ClaimStatus.Approved ||
      command.status === ClaimStatus.Denied
    ) {
      claim.resolvedAt = new Date();
    }

    policy.updatedBy = this.productsProvider.user().userId;
    policy.updatedByInfo = this.productsProvider.user();
    await policy.save();
  }
}
