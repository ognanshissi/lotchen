import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { AddTaskDialogComponent } from './add-task-dialog.component';

export interface AddTaskDialogData {
  relatedId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AddTaskDialogService {
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);

  public open(data: AddTaskDialogData): void {
    console.log('open add task dialog', data);
    this._dialog.open(AddTaskDialogComponent, {
      width: '500px',
      data: {
        relatedId: data.relatedId,
      },
    });
  }
}
