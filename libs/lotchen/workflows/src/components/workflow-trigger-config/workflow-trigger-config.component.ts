import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  signal,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  WorkflowTriggerDto,
  WorkflowTriggerDtoTypeEnum,
} from '@talisoft/api/lotchen-client-api';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { TasSelect } from '@talisoft/ui/select';
import { TasIcon } from '@talisoft/ui/icon';

@Component({
  selector: 'workflow-trigger-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-trigger-config.component.html',
  imports: [FormsModule, FormField, TasLabel, TasInput, TasSelect, TasIcon],
})
export class WorkflowTriggerConfigComponent implements OnInit {
  trigger = input<WorkflowTriggerDto | undefined>();
  triggerChange = output<WorkflowTriggerDto>();

  localTrigger = signal<WorkflowTriggerDto>({
    type: WorkflowTriggerDtoTypeEnum.Manual,
    config: {},
  });

  triggerTypes = [
    { value: 'status_change', label: 'Changement de statut' },
    { value: 'new_lead', label: 'Nouveau lead' },
    { value: 'form_submission', label: 'Soumission de formulaire' },
    { value: 'date_based', label: 'Basé sur une date' },
    { value: 'manual', label: 'Manuel' },
  ];

  contactStatuses = [
    { value: 'new', label: 'Nouveau' },
    { value: 'contacted', label: 'Contacté' },
    { value: 'qualified', label: 'Qualifié' },
    { value: 'disqualified', label: 'Disqualifié' },
    { value: 'converted_to_prospect', label: 'Converti en prospect' },
  ];

  ngOnInit(): void {
    const t = this.trigger();
    if (t) {
      this.localTrigger.set({ ...t, config: { ...(t.config || {}) } });
    }
  }

  setType(type: string): void {
    this.localTrigger.set({
      type: type as WorkflowTriggerDtoTypeEnum,
      config: {},
    });
    this.triggerChange.emit(this.localTrigger());
  }

  setConfig(key: string, value: string): void {
    this.localTrigger.update((trigger) => ({
      ...trigger,
      config: { ...(trigger.config || {}), [key]: value },
    }));
    this.triggerChange.emit(this.localTrigger());
  }

  getConfig(key: string): string {
    return (this.localTrigger().config as Record<string, any>)?.[key] || '';
  }
}
