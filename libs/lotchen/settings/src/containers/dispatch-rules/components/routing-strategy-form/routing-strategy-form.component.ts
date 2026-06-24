import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasSelect } from '@talisoft/ui/select';
import { ButtonModule } from '@talisoft/ui/button';

export interface RoutingStrategyValue {
  method: string;
  params: Record<string, any>;
}

interface MethodOption {
  value: string;
  label: string;
  description: string;
  params: MethodParam[];
}

interface MethodParam {
  key: string;
  label: string;
  type: 'number' | 'text' | 'boolean';
  placeholder?: string;
}

const METHOD_OPTIONS: MethodOption[] = [
  {
    value: 'round_robin',
    label: 'Tourniquet (Round Robin)',
    description:
      'Distribue les enregistrements à tour de rôle entre les agents.',
    params: [],
  },
  {
    value: 'least_loaded',
    label: 'Moins chargé',
    description: "Assigne à l'agent ayant le moins de tâches en cours.",
    params: [],
  },
  {
    value: 'skill_based',
    label: 'Basé sur les compétences',
    description: 'Assigne selon les compétences requises.',
    params: [
      {
        key: 'requiredSkills',
        label: 'Compétences requises (séparées par des virgules)',
        type: 'text',
        placeholder: 'Ex: crédit, assurance',
      },
    ],
  },
  {
    value: 'territory_based',
    label: 'Basé sur le territoire',
    description: "Assigne à l'agent du territoire correspondant.",
    params: [
      {
        key: 'territoryField',
        label: 'Champ territoire',
        type: 'text',
        placeholder: 'Ex: territory',
      },
    ],
  },
  {
    value: 'first_available',
    label: 'Premier disponible',
    description: 'Assigne au premier agent disponible.',
    params: [],
  },
  {
    value: 'custom_score',
    label: 'Score personnalisé',
    description: 'Assigne selon un score calculé.',
    params: [
      {
        key: 'scoreField',
        label: 'Champ de score',
        type: 'text',
        placeholder: 'Ex: matchScore',
      },
      {
        key: 'minScore',
        label: 'Score minimum',
        type: 'number',
        placeholder: '0',
      },
    ],
  },
];

@Component({
  selector: 'dispatch-routing-strategy-form',
  templateUrl: './routing-strategy-form.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    FormField,
    TasLabel,
    TasSelect,
    ButtonModule,
  ],
})
export class RoutingStrategyFormComponent {
  public strategy = input<RoutingStrategyValue | null>(null);
  public strategyChange = output<RoutingStrategyValue>();

  public readonly methodOptions = METHOD_OPTIONS;

  public selectedMethod = computed(
    () =>
      METHOD_OPTIONS.find((m) => m.value === this.strategy()?.method) ?? null
  );

  public setMethod(method: string): void {
    this.strategyChange.emit({ method, params: {} });
  }

  public setParam(key: string, value: any): void {
    const current = this.strategy();
    this.strategyChange.emit({
      method: current?.method ?? '',
      params: { ...(current?.params ?? {}), [key]: value },
    });
  }

  public getParam(key: string): any {
    return this.strategy()?.params?.[key] ?? '';
  }
}
