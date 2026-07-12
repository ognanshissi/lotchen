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
import { CapacityRulesDto } from '@talisoft/api/lotchen-client-api';

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
  public capacity = input<CapacityRulesDto>();
  public capacityChange = output<CapacityRulesDto>();

  public getValue(field: keyof CapacityRulesDto): number | undefined {
    return this.capacity()?.[field] ?? undefined;
  }

  public setValue(field: keyof CapacityRulesDto, raw: string): void {
    const num = raw === '' ? null : Number(raw);
    this.capacityChange.emit({
      maxOpenTickets: this.getValue('maxOpenTickets'),
      maxDailyAssignments: this.getValue('maxDailyAssignments'),
      concurrentThreshold: this.getValue('concurrentThreshold'),
      [field]: num,
    });
  }
}
