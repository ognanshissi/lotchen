import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { TasLabel, FormField } from '@talisoft/ui/form-field';
import { TasIcon } from '@talisoft/ui/icon';
import { AbstractControlValueAccessor } from '@talisoft/ui/core';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { OverlayModule } from '@angular/cdk/overlay';
import { TasInput } from '@talisoft/ui/input';
1;
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from '@talisoft/ui/button';
@Component({
  selector: 'tas-summary-field',
  templateUrl: './summary-field.html',
  standalone: true,
  imports: [
    TasLabel,
    TasIcon,
    AbstractControlValueAccessor,
    CdkConnectedOverlay,
    OverlayModule,
    FormField,
    ReactiveFormsModule,
    ButtonModule,
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
  public type = input<'text' | 'number' | 'date'>('text');
  public placeholder = input<string>('');
  public value = input<string | number | Date | undefined>(undefined);
  public editable = input<boolean>(false);

  public isOpen = signal(false);

  public control = new FormControl();

  public ngOnInit() {
    this.control.patchValue(this.value());
  }

  public handleSubmittion() {
    console.log(this.control.value);
  }
}
