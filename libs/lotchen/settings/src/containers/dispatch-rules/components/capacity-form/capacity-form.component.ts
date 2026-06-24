import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasIcon } from '@talisoft/ui/icon';

export interface CapacityRulesValue {
  maxOpenTickets: number | null;
  maxDailyAssignments: number | null;
  concurrentThreshold: number | null;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'dispatch-capacity-form',
  templateUrl: './capacity-form.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, FormField, TasLabel, TasIcon],
})
export class CapacityFormComponent {
  public capacity = input<CapacityRulesValue | null>(null);
  public capacityChange = output<CapacityRulesValue>();

  public getValue(field: keyof CapacityRulesValue): number | null {
    return this.capacity()?.[field] ?? null;
  }

  public setValue(field: keyof CapacityRulesValue, raw: string): void {
    const num = raw === '' ? null : Number(raw);
    this.capacityChange.emit({
      maxOpenTickets: this.getValue('maxOpenTickets'),
      maxDailyAssignments: this.getValue('maxDailyAssignments'),
      concurrentThreshold: this.getValue('concurrentThreshold'),
      [field]: num,
    });
  }
}
