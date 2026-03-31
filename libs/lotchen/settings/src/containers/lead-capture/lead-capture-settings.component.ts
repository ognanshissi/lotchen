import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { Dialog } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { AddCaptureConfigDialogComponent } from '../../components/add-capture-config-dialog/add-capture-config-dialog.component';
import { CaptureScriptDialogComponent } from '../../components/capture-script-dialog/capture-script-dialog.component';
import { LinkedInImportDialogComponent } from '../../components/linkedin-import-dialog/linkedin-import-dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';
import {
  FindAllCaptureConfigsQueryResponse,
  LeadCaptureConfigsApiService,
} from '@talisoft/api/lotchen-client-api';
import { ConfirmDialogService } from '@talisoft/ui/confirm-dialog';
import { FindAllCaptureConfigsQuery } from 'libs/lotchen-api/contact/src/leads/capture-config/find-all/find-all-capture-configs.query';

export interface CaptureConfigItem {
  id: string;
  name: string;
  platform: string;
  apiKey: string;
  isActive: boolean;
  allowedDomains: string[];
  fieldMapping?: Record<string, string>;
  routingRule?: {
    type: string;
    assignToUserId?: string;
    assignToTeamId?: string;
  } | null;
  createdAt: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  website: 'Site web',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  'google-forms': 'Google Forms',
};

@Component({
  selector: 'settings-lead-capture',
  standalone: true,
  imports: [TasTitle, TasText, TasCard, TasIcon, ButtonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'lead-capture-settings.component.html',
})
export class LeadCaptureSettingsComponent implements OnInit {
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _clipboard = inject(Clipboard);
  private readonly _leadCaptureConfigApiService = inject(
    LeadCaptureConfigsApiService
  );
  private readonly _confirmDialogService = inject(ConfirmDialogService);

  public configs = signal<FindAllCaptureConfigsQueryResponse[]>([]);

  public ngOnInit(): void {
    this.loadConfigs();
  }

  public loadConfigs(): void {
    this._leadCaptureConfigApiService
      .captureConfigControllerFindAllV1()
      .subscribe({
        next: (data) => this.configs.set(data),
      });
  }

  public platformLabel(platform: string): string {
    return PLATFORM_LABELS[platform] ?? platform;
  }

  public maskApiKey(key: string): string {
    if (!key || key.length < 8) return key;
    return key.substring(0, 8) + '...';
  }

  public copyApiKey(key: string): void {
    this._clipboard.copy(key);
    this._snackbar.success('Copié', 'Clé API copiée dans le presse-papier');
  }

  public openAddDialog(): void {
    const ref = this._dialog.open(AddCaptureConfigDialogComponent, {
      width: '600px',
      data: { mode: 'create' },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadConfigs();
    });
  }

  public openEditDialog(config: FindAllCaptureConfigsQueryResponse): void {
    const ref = this._dialog.open(AddCaptureConfigDialogComponent, {
      width: '600px',
      data: { mode: 'edit', config },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadConfigs();
    });
  }

  public openScriptDialog(config: FindAllCaptureConfigsQueryResponse): void {
    this._dialog.open(CaptureScriptDialogComponent, {
      width: '700px',
      data: { configId: config.id, configName: config.name },
    });
  }

  public openLinkedInImportDialog(
    config: FindAllCaptureConfigsQueryResponse
  ): void {
    const ref = this._dialog.open(LinkedInImportDialogComponent, {
      width: '800px',
      data: { configId: config.id, configName: config.name },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadConfigs();
    });
  }

  public deleteConfig(config: FindAllCaptureConfigsQueryResponse): void {
    this._confirmDialogService.confirm({
      title: 'Confirmation',
      message: `Supprimer l'intégration "${config.name}" ?`,
      closable: false,
      acceptButtonProps: {
        label: 'Supprimer',
        theme: 'warn',
      },
      showCancelButton: true,
      accept: () => {
        this._leadCaptureConfigApiService
          .captureConfigControllerDeleteV1(config.id)
          .subscribe({
            next: () => {
              this._snackbar.success('Succès', 'Intégration supprimée');
              this.loadConfigs();
            },
            error: () => {
              this._snackbar.error(
                'Erreur',
                "Impossible de supprimer l'intégration"
              );
            },
          });
      },
    });
  }
}

export default LeadCaptureSettingsComponent;
