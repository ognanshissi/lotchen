import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { CommandHandler } from '@lotchen/api/core';
import { CurrenciesProvider } from '../currencies.provider';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

export class UpdateCurrencyCommand {
  id!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Injectable()
export class UpdateCurrencyCommandHandler
  implements CommandHandler<UpdateCurrencyCommand, void>
{
  constructor(private readonly currenciesProvider: CurrenciesProvider) {}

  public async handlerAsync(command: UpdateCurrencyCommand): Promise<void> {
    const currency = await this.currenciesProvider.CurrencyModel.findOne({
      _id: command.id,
      deletedAt: null,
    });

    if (!currency) {
      throw new NotFoundException('Devise introuvable');
    }

    if (command.code) {
      const duplicate = await this.currenciesProvider.CurrencyModel.findOne({
        code: command.code.toUpperCase(),
        _id: { $ne: command.id },
        deletedAt: null,
      }).lean();

      if (duplicate) {
        throw new BadRequestException(
          `Une devise avec le code '${command.code}' existe déjà`
        );
      }
      currency.code = command.code.toUpperCase();
    }

    if (command.name !== undefined) currency.name = command.name;
    if (command.symbol !== undefined) currency.symbol = command.symbol;
    if (command.isActive !== undefined) currency.isActive = command.isActive;

    if (command.isDefault === true) {
      await this.currenciesProvider.CurrencyModel.updateMany(
        { isDefault: true, deletedAt: null },
        { $set: { isDefault: false } }
      );
      currency.isDefault = true;
    }

    await currency.save();
  }
}
