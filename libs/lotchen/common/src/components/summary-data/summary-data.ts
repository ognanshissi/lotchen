import { Component, input } from '@angular/core';
import { TasSummaryField } from '@talisoft/ui/summary-field';

@Component({
  selector: 'tas-summary',
  template: `<ng-content></ng-content>`,
  standalone: true,
  imports: [TasSummaryField],
})
export class TasSummaryData<T> {
  public object = input.required<T>();
}
