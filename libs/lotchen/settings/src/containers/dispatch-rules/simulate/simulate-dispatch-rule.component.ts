import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TasTitle } from '@talisoft/ui/title';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTag } from '@talisoft/ui/tag';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasSelect } from '@talisoft/ui/select';
import { TasSpinner } from '@talisoft/ui/spinner';
import { SnackbarService } from '@talisoft/ui/snackbar';

interface SimulateField {
  key: string;
  value: string;
}

interface SimulateResult {
  matched: boolean;
  matchedRuleId?: string;
  matchedRuleName?: string;
  conditionPath: string[];
  assignedTarget?: { type: string; targetId: string; isFallback: boolean };
}

const OBJECT_TYPES = [
  { value: 'lead', label: 'Lead' },
  { value: 'case', label: 'Dossier' },
  { value: 'ticket', label: 'Ticket' },
  { value: 'service_request', label: 'Demande de service' },
];

@Component({
  selector: 'settings-simulate-dispatch-rule',
  templateUrl: './simulate-dispatch-rule.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TasTitle,
    TasCard,
    TasIcon,
    TasTag,
    ButtonModule,
    FormField,
    TasLabel,
    TasSelect,
    TasSpinner,
  ],
})
export class SimulateDispatchRuleComponent {
  private readonly _http = inject(HttpClient);
  private readonly _route = inject(ActivatedRoute);
  private readonly _snackbar = inject(SnackbarService);

  public readonly objectTypes = OBJECT_TYPES;

  public objectType = signal('lead');
  public fields = signal<SimulateField[]>([{ key: '', value: '' }]);
  public isRunning = signal(false);
  public result = signal<SimulateResult | null>(null);

  public addField(): void {
    this.fields.update((f) => [...f, { key: '', value: '' }]);
  }

  public removeField(index: number): void {
    this.fields.update((f) => f.filter((_, i) => i !== index));
  }

  public setFieldKey(index: number, key: string): void {
    this.fields.update((f) =>
      f.map((field, i) => (i === index ? { ...field, key } : field))
    );
  }

  public setFieldValue(index: number, value: string): void {
    this.fields.update((f) =>
      f.map((field, i) => (i === index ? { ...field, value } : field))
    );
  }

  public run(): void {
    const fieldsMap: Record<string, string> = {};
    for (const f of this.fields()) {
      if (f.key.trim()) fieldsMap[f.key.trim()] = f.value;
    }

    this.isRunning.set(true);
    this.result.set(null);

    this._http
      .post<SimulateResult>('/api/v1/dispatch-rules/simulate', {
        objectType: this.objectType(),
        fields: fieldsMap,
      })
      .subscribe({
        next: (res) => {
          this.result.set(res);
          this.isRunning.set(false);
        },
        error: () => {
          this._snackbar.error('Erreur', 'Impossible de lancer la simulation');
          this.isRunning.set(false);
        },
      });
  }

  public getTargetTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      agent: 'Agent',
      team: 'Équipe',
      queue: 'File',
      department: 'Département',
    };
    return labels[type] ?? type;
  }
}

export default SimulateDispatchRuleComponent;
