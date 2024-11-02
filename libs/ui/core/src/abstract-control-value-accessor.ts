import { Component, forwardRef, HostBinding } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  template: '',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AbstractControlValueAccessor),
      multi: true,
    },
  ],
})
export class AbstractControlValueAccessor<T = unknown>
  implements ControlValueAccessor
{
  static nextId = 0;

  @HostBinding('id')
  id = `tas-input-id-${+Date.now()}`;

  protected _value!: T;

  public get value(): T {
    return this._value;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onTouched = () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onChange = (value: T) => {};

  /**
   *  Set the current value and update form control parent value
   * @param value
   */
  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  public set value(value: T) {
    this._value = value;
    this.onTouched();
    this.onChange(value);
  }

  public writeValue(obj: T): void {
    this.value = obj;
  }

  public registerOnChange(fn: never): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: never): void {
    this.onTouched = fn;
  }
}
