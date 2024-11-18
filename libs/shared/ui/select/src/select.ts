import {
  AfterViewInit,
  booleanAttribute,
  Component,
  forwardRef,
  input,
  OnInit,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AbstractControlValueAccessor } from 'libs/shared/ui/core';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'tas-select',
  templateUrl: './select.html',
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TasSelect),
      multi: true,
    },
  ],
})
export class TasSelect
  extends AbstractControlValueAccessor<string[] | string>
  implements OnInit, AfterViewInit
{
  public selectionModel!: SelectionModel<string>;

  public multiple = input(false, { transform: booleanAttribute });

  public filter = input(false, { transform: booleanAttribute });

  public options = input.required<Array<{ [key: string]: string }>>();

  public optionLabel = input<string>('label');

  public optionTemplate = viewChild('optionTemplate');

  public optionValue = input<string>('value');

  public ngOnInit(): void {
    this.selectionModel = new SelectionModel(this.multiple());
  }

  public ngAfterViewInit() {}

  /**
   * Update the writeValue method when the field has default value
   * @param obj
   */
  override writeValue(obj: string[] | string) {
    super.writeValue(obj);

    if (obj) {
      this.selectionModel.select(...obj);
    }
  }
}
