import { inject, Injectable, signal } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { CallerComponent } from './caller.component';

export interface CallerData {
  id: string;
  clientName: string;
  mobileNumber: string;
}

@Injectable({
  providedIn: 'root',
})
export class CallerService {
  private readonly _dialog = inject(Dialog);
  private readonly _isCallerOpened$ = signal(false);
  private callerDialogRef!: DialogRef<any, CallerComponent>;
  private readonly _currentClientId = signal<string | null>(null);

  public readonly currentClientId = this._currentClientId.asReadonly();
  public readonly isCallerOpened = this._isCallerOpened$.asReadonly();

  /**
   * Handle caller dialog state
   * @param data
   */
  public openCaller(data: CallerData) {
    this._isCallerOpened$.set(true);

    this._currentClientId.set(data.id);

    if (this.callerDialogRef) {
      this.callerDialogRef.close();
    }

    this.callerDialogRef = this._dialog.open(CallerComponent, {
      hasBackdrop: false,
      data,
    });

    this.callerDialogRef.closed.subscribe({
      next: () => {
        this._isCallerOpened$.set(false);
      },
    });
  }
}
