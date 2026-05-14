import { CurrencyPipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from 'libs/lotchen/common/src/services';

/**
 * Formats a numeric value as currency using the tenant's default currency.
 *
 * Usage:
 *   {{ amount | tasCurrency }}                    — uses default currency
 *   {{ amount | tasCurrency : 'USD' }}            — explicit currency code override
 *   {{ amount | tasCurrency : null : 3 }}         — custom digit format
 */
@Pipe({
  name: 'tasCurrency',
  standalone: true,
})
export class TasCurrencyPipe implements PipeTransform {
  private readonly _currencyService = inject(CurrencyService);

  transform(
    value: number | string | null | undefined,
    currencyCode?: string | null,
    maximumSignificantDigits: number = 3
  ): string | null {
    if (value == null) return null;

    const code = currencyCode || this._currencyService.defaultCurrencyCode();

    return new Intl.NumberFormat(navigator.language ?? 'fr-FR', {
      style: 'currency',
      currency: code,
      maximumSignificantDigits,
    }).format(value as number);
  }
}
