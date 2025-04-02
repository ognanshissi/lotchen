import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { TasLabel } from '@talisoft/ui/form-field';
import { TasIcon } from '@talisoft/ui/icon';

@Component({
  selector: 'tas-summary-field',
  templateUrl: './summary-field.html',
  standalone: true,
  imports: [TasLabel, TasIcon],
  styles: [
    `
      .actions {
      }
    `,
  ],

  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasSummaryField {
  public label = input();
  public rawField = input.required<string>();
  public editable = input<boolean>(false);
}
