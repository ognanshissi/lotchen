import { Component, inject, ViewEncapsulation } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { SnackbarPrimitiveData } from './snackbar.service';

@Component({
  selector: 'tas-snackbar',
  standalone: true,
  imports: [ButtonModule, TasIcon],
  template: ` <div class="snackbar__container w-full">
    <div class="flex items-center space-x-4 w-full">
      <div>
        <tas-icon
          [iconName]="iconName"
          [iconSize]="'lg'"
          [iconClass]="textColor"
        ></tas-icon>
      </div>
      <div class="ml-6 w-full">
        <div class="flex justify-between items-center">
          <div class="font-semibold text-lg">{{ data.header }}</div>

          <button tas-button iconButton (click)="dismiss()">
            <tas-icon iconName="close" [iconClass]="textColor"></tas-icon>
          </button>
        </div>
        <div class="mt-1">
          {{ data.message }}
        </div>
      </div>
    </div>
  </div>`,
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      .tas-snackbar--success,
      .tas-snackbar--error,
      .tas-snackbar--info {
        @apply border border-gray-200 border-l-4 bg-white;
      }

      .tas-snackbar--success {
        @apply border-l-functional-success;
      }

      .tas-snackbar--error {
        @apply border-l-functional-error;
      }

      .tas-snackbar--info {
        @apply border-l-functional-info;
      }
    `,
  ],
})
export class TasSnackbar {
  public readonly data: SnackbarPrimitiveData = inject(MAT_SNACK_BAR_DATA);
  private readonly _snackbarRef = inject(MatSnackBarRef);

  public get textColor(): string {
    return `text-functional-${this.data.type}`;
  }

  public get iconName(): string {
    switch (this.data.type) {
      case 'success':
        return 'feather:check-circle';
      case 'error':
        return 'feather:alert-triangle';
      case 'info':
        return 'feather:info';
      default:
        return 'feather:info';
    }
  }

  public dismiss() {
    this._snackbarRef.dismiss();
  }
}
