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
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasSelect } from '@talisoft/ui/select';

export interface DispatchCondition {
  field: string;
  operator: string;
  value: any;
}

export interface DispatchConditionGroup {
  operator: 'AND' | 'OR';
  conditions: (DispatchCondition | DispatchConditionGroup)[];
}

export function isGroup(
  item: DispatchCondition | DispatchConditionGroup
): item is DispatchConditionGroup {
  return 'conditions' in item;
}

const AVAILABLE_FIELDS = [
  { value: 'source', label: 'Source' },
  { value: 'score', label: 'Score' },
  { value: 'territory', label: 'Territoire' },
  { value: 'product', label: 'Produit' },
  { value: 'status', label: 'Statut' },
  { value: 'priority', label: 'Priorité' },
];

const OPERATORS = [
  { value: 'eq', label: '=' },
  { value: 'neq', label: '!=' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'contains', label: 'Contient' },
  { value: 'not_contains', label: 'Ne contient pas' },
];

@Component({
  selector: 'condition-builder',
  templateUrl: './condition-builder.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TasIcon,
    ButtonModule,
    FormField,
    TasLabel,
    TasSelect,
  ],
})
export class ConditionBuilderComponent {
  public group = input.required<DispatchConditionGroup>();
  public groupChange = output<DispatchConditionGroup>();
  public depth = input<number>(0);

  public readonly availableFields = AVAILABLE_FIELDS;
  public readonly operators = OPERATORS;

  public isGroup = isGroup;

  public asGroup(item: any): DispatchConditionGroup {
    return item as DispatchConditionGroup;
  }

  public asCondition(item: any): DispatchCondition {
    return item as DispatchCondition;
  }

  private emit(updated: DispatchConditionGroup): void {
    this.groupChange.emit(updated);
  }

  public setLogicalOperator(op: 'AND' | 'OR'): void {
    this.emit({ ...this.group(), operator: op });
  }

  public addCondition(): void {
    const newCondition: DispatchCondition = {
      field: '',
      operator: 'eq',
      value: '',
    };
    this.emit({
      ...this.group(),
      conditions: [...this.group().conditions, newCondition],
    });
  }

  public addGroup(): void {
    const newGroup: DispatchConditionGroup = {
      operator: 'AND',
      conditions: [],
    };
    this.emit({
      ...this.group(),
      conditions: [...this.group().conditions, newGroup],
    });
  }

  public removeItem(index: number): void {
    const updated = this.group().conditions.filter((_, i) => i !== index);
    this.emit({ ...this.group(), conditions: updated });
  }

  public updateCondition(
    index: number,
    field: keyof DispatchCondition,
    value: any
  ): void {
    const conditions = [...this.group().conditions];
    const condition = {
      ...(conditions[index] as DispatchCondition),
      [field]: value,
    };
    conditions[index] = condition;
    this.emit({ ...this.group(), conditions });
  }

  public updateSubGroup(
    index: number,
    updatedGroup: DispatchConditionGroup
  ): void {
    const conditions = [...this.group().conditions];
    conditions[index] = updatedGroup;
    this.emit({ ...this.group(), conditions });
  }
}
