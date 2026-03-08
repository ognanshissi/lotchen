import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasAlert } from '@talisoft/ui/alert';

export interface ConfirmDeleteDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'prospects-confirm-delete-dialog',
  standalone: true,
  imports: [ButtonModule, TasIcon, TasAlert],
  template: `
    <div class="bg-white rounded-lg p-6 w-[450px]">
      <div class="flex items-center space-x-2 mb-4">
        <tas-icon
          iconName="feather:alert-triangle"
          iconClass="text-functional-error"
        ></tas-icon>
        <h2 class="text-lg font-semibold">{{ data.title }}</h2>
      </div>

      <tas-alert type="error">
        {{ data.message }}
      </tas-alert>

      <div class="flex justify-end space-x-2 mt-6">
        <button tas-outlined-button (click)="dialogRef.close(false)">
          Annuler
        </button>
        <button tas-raised-button color="warn" (click)="dialogRef.close(true)">
          <tas-icon iconName="feather:trash"></tas-icon>
          Supprimer
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDeleteDialogComponent {
  public readonly dialogRef = inject(DialogRef<boolean>);
  public readonly data = inject<ConfirmDeleteDialogData>(DIALOG_DATA);
}
