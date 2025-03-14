import {
  Component,
  EventEmitter,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { ConfirmationDialogProps } from './confirm-dialog.service';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { DialogRef } from '@angular/cdk/dialog';
import { TasTitle } from '@talisoft/ui/title';
import { NgIf } from '@angular/common';

@Component({
  selector: 'tas-confirmation-dialog',
  template: `
    <div class="flex justify-between items-center py-2">
      <tas-title>{{ config.title }}</tas-title>
      <button
        tas-button
        iconButton
        *ngIf="config?.closable"
        (click)="close(); reject.emit()"
      >
        <tas-icon iconName="close"></tas-icon>
      </button>
    </div>

    <div class="py-8 flex space-x-2 ">
      <div>
        <tas-icon iconName="exclamation" iconClass="text-red-600"></tas-icon>
      </div>
      <div>{{ config.message }}</div>
    </div>

    <div class="flex space-x-3 justify-end">
      <button
        *ngIf="config.showCancelButton"
        tas-outlined-button
        color="neutral"
        (click)="close(); reject.emit()"
      >
        <tas-icon iconName="close"></tas-icon> &nbsp;
        {{ config.rejectButtonProps?.label ?? 'Annuler' }}
      </button>
      <button
        tas-raised-button
        color="primary"
        (click)="accept.emit(); close()"
      >
        <tas-icon iconName="check"></tas-icon> &nbsp;
        {{ config.acceptButtonProps?.label ?? 'Supprimer' }}
      </button>
    </div>
  `,
  standalone: true,
  imports: [ButtonModule, TasIcon, TasTitle, NgIf],
  encapsulation: ViewEncapsulation.Emulated,
  styles: [
    `
      :host {
        display: block;
        background: #fff;
        border-radius: 12px;
        padding: 8px 16px 16px;
      }
    `,
  ],
})
export class TasConfirmationDialog {
  private readonly _dialogRef = inject<DialogRef<boolean>>(DialogRef<boolean>);
  public config!: ConfirmationDialogProps;
  public accept: EventEmitter<string> = new EventEmitter<string>();
  public reject: EventEmitter<string> = new EventEmitter<string>();

  public close() {
    this._dialogRef.close(false);
  }
}
