import { CurrencyPipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from 'libs/lotchen/common/src/services';

/**
 * Formats a numeric value as currency using the tenant's default currency.
 *
 * Usage:
 *   {{ amount | tasCurrency }}                    — uses default currency
 *   {{ amount | tasCurrency : 'USD' }}            — explicit currency code override
 *   {{ amount | tasCurrency : null : '1.0-2' }}   — custom digit format
 */
@Pipe({
  name: 'tasCurrency',
  standalone: true,
})
export class TasCurrencyPipe implements PipeTransform {
  private readonly _currencyService = inject(CurrencyService);
  private readonly _currencyPipe = new CurrencyPipe('fr-FR');

  transform(
    value: number | string | null | undefined,
    currencyCode?: string | null,
    digitsInfo: string = '1.0-0',
    display: string = 'symbol-narrow'
  ): string | null {
    if (value == null) return null;

    const code = currencyCode || this._currencyService.defaultCurrencyCode();

    return this._currencyPipe.transform(value, code, display, digitsInfo);
  }
}
