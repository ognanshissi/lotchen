import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { CurrenciesProvider } from '../currencies.provider';
import { BadRequestException, Injectable } from '@nestjs/common';

export class CreateCurrencyCommand {
  @ApiProperty({ description: 'ISO 4217 currency code', example: 'XOF' })
  @IsNotEmpty({ message: 'Le code devise est obligatoire' })
  code!: string;

  @ApiProperty({ description: 'Currency display name', example: 'Franc CFA' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  name!: string;

  @ApiProperty({ description: 'Currency symbol', example: 'FCFA' })
  @IsNotEmpty({ message: 'Le symbole est obligatoire' })
  symbol!: string;

  @ApiProperty({
    description: 'Currency exchange rate to default currency',
    example: 1,
  })
  @IsNotEmpty({ message: 'Le taux de change est obligatoire' })
  @IsNumber(undefined, { message: 'Le taux de change doit être un nombre' })
  rate!: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateCurrencyCommandResponse {
  @ApiProperty() id!: string;
}

@Injectable()
export class CreateCurrencyCommandHandler
  implements
    CommandHandler<CreateCurrencyCommand, CreateCurrencyCommandResponse>
{
  constructor(private readonly currenciesProvider: CurrenciesProvider) {}

  public async handlerAsync(
    command: CreateCurrencyCommand
  ): Promise<CreateCurrencyCommandResponse> {
    const existing = await this.currenciesProvider.CurrencyModel.findOne({
      code: command.code.toUpperCase(),
      deletedAt: null,
    }).lean();

    if (existing) {
      throw new BadRequestException(
        `Une devise avec le code '${command.code}' existe déjà`
      );
    }

    if (command.isDefault) {
      await this.currenciesProvider.CurrencyModel.updateMany(
        { isDefault: true, deletedAt: null },
        { $set: { isDefault: false } }
      );
    }

    const currency = new this.currenciesProvider.CurrencyModel({
      code: command.code.toUpperCase(),
      name: command.name,
      symbol: command.symbol,
      rate: command.rate,
      isDefault: command.isDefault ?? false,
    });

    await currency.save();

    return { id: currency._id };
  }
}
