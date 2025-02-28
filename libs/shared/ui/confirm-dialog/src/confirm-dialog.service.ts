import { inject, Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { TasConfirmationDialog } from './confirm-dialog';

export interface ConfirmationDialogProps {
  title: string;
  message: string;
  closable: boolean;
  closeOnEscape?: boolean;

  width?: string;

  icon?: string;

  rejectButtonProps?: {
    label: string;
    icon?: string;
  };

  acceptButtonProps?: {
    label: string;
    icon?: string;
  };

  accept: () => void;
  reject: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _dialog = inject(Dialog);

  public confirm(config: ConfirmationDialogProps) {
    const confirmationDialog = this._dialog.open(TasConfirmationDialog, {
      width: config.width ?? '300px',
      disableClose: true,
    });

    if (confirmationDialog?.componentInstance) {
      confirmationDialog.componentInstance.config = config;
      confirmationDialog.componentInstance.accept.subscribe(() =>
        config?.accept()
      );
      confirmationDialog.componentInstance.reject.subscribe(() =>
        config.reject()
      );
    }

    confirmationDialog.closed.subscribe();
  }
}
