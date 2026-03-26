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
  template: `
    <div class="py-8 px-6 bg-white">
      <div class="flex justify-between items-center">
        <div>
          <tas-title>Capture de leads</tas-title>
          <tas-text
            >Configurez vos intégrations pour capturer des leads depuis
            différentes sources</tas-text
          >
        </div>
        <button tas-raised-button color="primary" (click)="openAddDialog()">
          <tas-icon iconName="feather:plus"></tas-icon>
          Ajouter une intégration
        </button>
      </div>
    </div>

    <div class="p-6">
      <tas-card>
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">Nom</th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Plateforme
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Clé API
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Statut
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Domaines autorisés
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            @for (config of configs(); track config.id) {
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 font-medium">{{ config.name }}</td>
              <td class="py-3 px-4">{{ platformLabel(config.platform) }}</td>
              <td class="py-3 px-4">
                <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{
                  maskApiKey(config.apiKey)
                }}</code>
                <button
                  class="ml-2 text-gray-400 hover:text-gray-600"
                  (click)="copyApiKey(config.apiKey)"
                >
                  <tas-icon iconName="feather:copy"></tas-icon>
                </button>
              </td>
              <td class="py-3 px-4">
                @if (config.isActive) {
                <span
                  class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                  >Actif</span
                >
                } @else {
                <span
                  class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                  >Inactif</span
                >
                }
              </td>
              <td class="py-3 px-4 text-sm text-gray-500">
                {{ config.allowedDomains?.join(', ') || '-' }}
              </td>
              <td class="py-3 px-4 flex gap-2">
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0"
                  (click)="openEditDialog(config)"
                  title="Modifier"
                >
                  <tas-icon iconName="feather:edit-2"></tas-icon>
                </button>
                @if (config.platform === 'website') {
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0"
                  (click)="openScriptDialog(config)"
                  title="Voir le script"
                >
                  <tas-icon iconName="feather:code"></tas-icon>
                </button>
                } @if (config.platform === 'linkedin') {
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0"
                  (click)="openLinkedInImportDialog(config)"
                  title="Importer depuis LinkedIn"
                >
                  <tas-icon iconName="feather:download"></tas-icon>
                </button>
                }
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0 !text-red-500"
                  (click)="deleteConfig(config)"
                  title="Supprimer"
                >
                  <tas-icon iconName="feather:trash-2"></tas-icon>
                </button>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </tas-card>
    </div>
  `,
})
export class LeadCaptureSettingsComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _clipboard = inject(Clipboard);

  public configs = signal<CaptureConfigItem[]>([]);

  public ngOnInit(): void {
    this.loadConfigs();
  }

  public loadConfigs(): void {
    this._http
      .get<CaptureConfigItem[]>('/api/v1/lead-capture-configs')
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

  public openEditDialog(config: CaptureConfigItem): void {
    const ref = this._dialog.open(AddCaptureConfigDialogComponent, {
      width: '600px',
      data: { mode: 'edit', config },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadConfigs();
    });
  }

  public openScriptDialog(config: CaptureConfigItem): void {
    this._dialog.open(CaptureScriptDialogComponent, {
      width: '700px',
      data: { configId: config.id, configName: config.name },
    });
  }

  public openLinkedInImportDialog(config: CaptureConfigItem): void {
    const ref = this._dialog.open(LinkedInImportDialogComponent, {
      width: '800px',
      data: { configId: config.id, configName: config.name },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadConfigs();
    });
  }

  public deleteConfig(config: CaptureConfigItem): void {
    if (!confirm(`Supprimer l'intégration "${config.name}" ?`)) return;
    this._http.delete(`/api/v1/lead-capture-configs/${config.id}`).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Intégration supprimée');
        this.loadConfigs();
      },
      error: () => {
        this._snackbar.error('Erreur', "Impossible de supprimer l'intégration");
      },
    });
  }
}

export default LeadCaptureSettingsComponent;
