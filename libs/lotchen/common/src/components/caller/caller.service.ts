import { inject, Injectable, signal } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { CallerComponent } from './caller.component';
import { SnackbarService } from '@talisoft/ui/snackbar';

export interface CallerData {
  id: string;
  clientName: string;
  mobileNumber: string;
}

export interface IncomingCallerData {
  callerNumber: string;
  callSid: string;
  contactId?: string;
  contactName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CallerService {
  private readonly _dialog = inject(Dialog);
  private readonly _isCallerOpened$ = signal(false);
  private callerDialogRef!: DialogRef<any, CallerComponent>;
  private readonly _currentClientId = signal<string | null>(null);
  private readonly _snackbar = inject(SnackbarService);

  public readonly currentClientId = this._currentClientId.asReadonly();
  public readonly isCallerOpened = this._isCallerOpened$.asReadonly();

  /**
   * Handle caller dialog state for outgoing calls
   */
  public openCaller(data: CallerData) {
    if (!data.mobileNumber) {
      this._snackbar.error(
        'Attention',
        "Aucun numéro de téléphone n'est défini "
      );
      return;
    }
    this._isCallerOpened$.set(true);

    this._currentClientId.set(data.id);

    if (this.callerDialogRef) {
      this.callerDialogRef.close();
    }

    this.callerDialogRef = this._dialog.open(CallerComponent, {
      hasBackdrop: false,
      data: { ...data, mode: 'outbound' },
    });

    this.callerDialogRef.closed.subscribe({
      next: () => {
        this._isCallerOpened$.set(false);
      },
    });
  }

  /**
   * Handle caller dialog state for incoming calls
   */
  public openIncomingCaller(data: IncomingCallerData) {
    this._isCallerOpened$.set(true);

    if (data.contactId) {
      this._currentClientId.set(data.contactId);
    }

    if (this.callerDialogRef) {
      this.callerDialogRef.close();
    }

    this.callerDialogRef = this._dialog.open(CallerComponent, {
      hasBackdrop: false,
      data: {
        id: data.contactId ?? '',
        clientName: data.contactName ?? data.callerNumber,
        mobileNumber: data.callerNumber,
        callSid: data.callSid,
        mode: 'inbound',
      },
    });

    this.callerDialogRef.closed.subscribe({
      next: () => {
        this._isCallerOpened$.set(false);
      },
    });
  }
}
