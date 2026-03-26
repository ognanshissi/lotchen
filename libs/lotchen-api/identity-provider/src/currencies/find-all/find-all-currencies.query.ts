import { ApiProperty } from '@nestjs/swagger';
import { QueryHandler } from '@lotchen/api/core';
import { CurrenciesProvider } from '../currencies.provider';
import { Injectable } from '@nestjs/common';

export class FindAllCurrenciesQueryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty()
  rate!: number;
  @ApiProperty() symbol!: string;
  @ApiProperty() isDefault!: boolean;
  @ApiProperty() isActive!: boolean;
}

@Injectable()
export class FindAllCurrenciesQueryHandler
  implements QueryHandler<never, FindAllCurrenciesQueryResponse[]>
{
  constructor(private readonly currenciesProvider: CurrenciesProvider) {}

  public async handlerAsync(): Promise<FindAllCurrenciesQueryResponse[]> {
    const currencies = await this.currenciesProvider.CurrencyModel.find({
      deletedAt: null,
    })
      .sort({ isDefault: -1, name: 1 })
      .lean()
      .exec();

    return currencies.map((c) => ({
      id: c._id,
      code: c.code,
      name: c.name,
      rate: c.rate,
      symbol: c.symbol,
      isDefault: c.isDefault,
      isActive: c.isActive,
    }));
  }
}
