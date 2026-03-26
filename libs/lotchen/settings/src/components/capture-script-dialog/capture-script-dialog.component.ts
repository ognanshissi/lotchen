import { Component, inject, OnInit, signal } from '@angular/core';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { ButtonModule } from '@talisoft/ui/button';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { Clipboard } from '@angular/cdk/clipboard';
import { SnackbarService } from '@talisoft/ui/snackbar';

export interface CaptureScriptDialogData {
  configId: string;
  configName: string;
}

@Component({
  selector: 'settings-capture-script-dialog',
  standalone: true,
  imports: [
    TasSideDrawer,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    TasIcon,
    TasClosableDrawer,
    TasTitle,
    TasText,
    ButtonModule,
  ],
  template: `
    <tas-side-drawer>
      <tas-drawer-title>
        <tas-title>Script de capture — {{ data.configName }}</tas-title>
      </tas-drawer-title>
      <tas-drawer-content>
        <tas-text class="mb-4"
          >Copiez ce script et collez-le dans le code HTML de votre site web,
          juste avant la balise &lt;/body&gt;.</tas-text
        >
        <pre
          class="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap"
          >{{ script() }}</pre
        >
      </tas-drawer-content>
      <tas-drawer-action>
        <button tas-outlined-button closable-drawer>
          <tas-icon iconName="close"></tas-icon>
          Fermer
        </button>
        <button tas-raised-button color="primary" (click)="copyScript()">
          <tas-icon iconName="feather:copy"></tas-icon>
          Copier
        </button>
      </tas-drawer-action>
    </tas-side-drawer>
  `,
})
export class CaptureScriptDialogComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _clipboard = inject(Clipboard);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: CaptureScriptDialogData = inject(DIALOG_DATA);

  public script = signal('Chargement...');

  public ngOnInit(): void {
    this._http
      .get<{ script: string }>(
        `/api/v1/lead-capture-configs/${this.data.configId}/script`
      )
      .subscribe({
        next: (res) => this.script.set(res.script),
        error: () => this.script.set('Erreur lors du chargement du script'),
      });
  }

  public copyScript(): void {
    this._clipboard.copy(this.script());
    this._snackbar.success('Copié', 'Script copié dans le presse-papier');
  }
}
