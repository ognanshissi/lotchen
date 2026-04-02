import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TasIcon } from '../../icon';
import { FormField, TasLabel } from '../../form-field';
import { ButtonModule } from '../../button';
import { TasInput } from '../../input';
import { TasDatePicker } from '../../date-picker';
import { TasSelect } from '@talisoft/ui/select';
@Component({
  selector: 'tas-summary-field',
  templateUrl: './summary-field.html',
  standalone: true,
  imports: [
    TasLabel,
    TasIcon,
    CdkConnectedOverlay,
    OverlayModule,
    FormField,
    ReactiveFormsModule,
    ButtonModule,
    TasInput,
    TasLabel,
    ButtonModule,
    FormField,
    TasLabel,
    TasDatePicker,
    TasSelect,
  ],
  styles: [
    `
      .actions {
      }
    `,
  ],

  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasSummaryField implements OnInit {
  public label = input();
  public rawField = input.required<string>();
  public type = input<
    | 'text'
    | 'number'
    | 'date'
    | 'select'
    | 'datetime'
    | 'date-range'
    | 'dropdown'
  >('text');
  public placeholder = input<string>('');
  public value = input<string | number | Date | any>(undefined);
  public editable = input<boolean>(false);

  public options = input<{ label: string; value: string }[]>([]);

  public validators = input<
    'required' | 'nullable' | 'email' | 'number' | 'pattern'
  >('nullable');

  public fieldSaved = output<{ field: string; value: any }>();

  public isOpen = signal(false);

  public control = new FormControl();

  public ngOnInit() {
    this.control.patchValue(this.value());

    if (this.type() === 'date') {
      this.control.patchValue(
        this.value() ? new Date(this.value()) : undefined,
        { emitEvent: true }
      );
      console.log(new Date(this.value()));
    }
  }

  public handleSubmit() {
    this.fieldSaved.emit({ field: this.rawField(), value: this.control.value });
    this.isOpen.set(false);
  }
}
