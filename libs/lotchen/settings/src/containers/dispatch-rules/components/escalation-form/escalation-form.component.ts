import {
  Component,
  inject,
  input,
  output,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasTag } from '@talisoft/ui/tag';
import { EligibleTarget } from '../target-selector/target-selector.component';

export interface EscalationRuleValue {
  trigger: string;
  delayMinutes: number;
  targetId: string;
  targetLabel: string;
  notifyOnEscalation: boolean;
}

const TRIGGER_OPTIONS = [
  { value: 'sla_breach', label: 'Violation de SLA' },
  { value: 'no_response', label: 'Aucune réponse' },
  { value: 'customer_request', label: 'Demande du client' },
  { value: 'inactivity', label: 'Inactivité' },
  { value: 'priority_upgrade', label: 'Montée en priorité' },
];

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'dispatch-escalation-form',
  templateUrl: './escalation-form.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    FormField,
    TasLabel,
    TasIcon,
    ButtonModule,
    TasTag,
  ],
})
export class EscalationFormComponent implements OnInit {
  private readonly _http = inject(HttpClient);

  public escalationRules = input<EscalationRuleValue[]>([]);
  public escalationRulesChange = output<EscalationRuleValue[]>();

  public eligibleTargets = signal<EligibleTarget[]>([]);
  public triggerOptions = TRIGGER_OPTIONS;

  public ngOnInit(): void {
    this._http
      .get<EligibleTarget[]>('/api/v1/dispatch-rules/eligible-targets')
      .subscribe({ next: (data) => this.eligibleTargets.set(data) });
  }

  public addRule(): void {
    this.escalationRulesChange.emit([
      ...this.escalationRules(),
      {
        trigger: 'sla_breach',
        delayMinutes: 60,
        targetId: '',
        targetLabel: '',
        notifyOnEscalation: true,
      },
    ]);
  }

  public removeRule(index: number): void {
    this.escalationRulesChange.emit(
      this.escalationRules().filter((_, i) => i !== index)
    );
  }

  public updateRule(
    index: number,
    field: keyof EscalationRuleValue,
    value: any
  ): void {
    const rules = this.escalationRules().map((r, i) => {
      if (i !== index) return r;
      if (field === 'targetId') {
        const target = this.eligibleTargets().find((t) => t.id === value);
        return { ...r, targetId: value, targetLabel: target?.label ?? value };
      }
      return { ...r, [field]: value };
    });
    this.escalationRulesChange.emit(rules);
  }

  public getTriggerLabel(value: string): string {
    return TRIGGER_OPTIONS.find((o) => o.value === value)?.label ?? value;
  }

  public getTargetLabel(targetId: string): string {
    return (
      this.eligibleTargets().find((t) => t.id === targetId)?.label ?? targetId
    );
  }
}
