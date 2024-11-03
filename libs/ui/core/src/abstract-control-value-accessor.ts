import { Component, ElementRef, forwardRef, HostBinding, inject, signal } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR, NgControl,
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';

@Component({
  template: '',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AbstractControlValueAccessor),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AbstractControlValueAccessor),
      multi: true,
    },
  ],
})
export class AbstractControlValueAccessor<T = unknown>
  implements ControlValueAccessor, Validator
{

  static nextId = 0;

  @HostBinding('id')
  id = `tas-input-id-${+Date.now()}`;

  protected disabled = signal<boolean>(false);

  protected _value!: T;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onTouched = () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onChange = (value: T) => {};


  public get value(): T {
    return this._value;
  }

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

  constructor() {
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

  public setDisabledState(isDisabled: boolean) {
    this.disabled.set(isDisabled);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return null;
  }
  registerOnValidatorChange?(fn: () => void): void {
    this.onTouched = fn;
  }
}
