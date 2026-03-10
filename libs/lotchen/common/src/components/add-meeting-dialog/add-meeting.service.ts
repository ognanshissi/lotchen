import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import {
  AddMeetingDialogComponent,
  AddMeetingDialogData,
} from './add-meeting-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class AddMeetingDialogService {
  private readonly _dialog = inject(Dialog);

  public open(data: AddMeetingDialogData): void {
    this._dialog.open(AddMeetingDialogComponent, {
      width: '600px',
      data,
    });
  }
}
