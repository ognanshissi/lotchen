import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Currency } from './currency.schema';

@Injectable()
export class CurrenciesProvider {
  constructor(
    @Inject('CURRENCY_MODEL') public readonly CurrencyModel: Model<Currency>
  ) {}
}
