import { Component, input } from '@angular/core';
import { TasLabel } from '../../form-field';

@Component({
  selector: 'tas-summary-field',
  templateUrl: './summary-field.html',
  standalone: true,
  imports: [TasLabel],
})
export class TasSummaryField {
  public label = input();
  public rawField = input.required<string>();
}
