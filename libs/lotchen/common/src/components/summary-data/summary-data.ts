import { Component, input } from '@angular/core';
import { TasSummaryField } from '../summary-field';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'tas-summary',
  template: `<ng-content></ng-content>`,
  standalone: true,
  imports: [TasSummaryField],
})
export class TasSummaryData<T> {
  public object = input.required<T>();
}
