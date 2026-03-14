import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import {
  NgIf,
  NgFor,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { WorkflowNodeDto } from '@talisoft/api/lotchen-client-api';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { ButtonModule } from '@talisoft/ui/button';

export interface NodeConfigDialogData {
  node: WorkflowNodeDto;
}

@Component({
  selector: 'workflow-node-config-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-node-config-drawer.component.html',
  imports: [
    NgIf,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    FormsModule,
    FormField,
    TasLabel,
    ButtonModule,
  ],
})
export class WorkflowNodeConfigDrawerComponent implements OnInit {
  private readonly _dialogRef = inject<DialogRef<WorkflowNodeDto>>(DialogRef);
  readonly data = inject<NodeConfigDialogData>(DIALOG_DATA);

  node = signal<WorkflowNodeDto>({
    ...this.data.node,
    config: { ...(this.data.node.config || {}) },
  });

  ngOnInit(): void {}

  getConfig(key: string): any {
    return (this.node().config as Record<string, any>)?.[key];
  }

  setConfig(key: string, value: any): void {
    this.node.update((n) => ({
      ...n,
      config: { ...(n.config || {}), [key]: value },
    }));
  }

  setLabel(label: string): void {
    this.node.update((n) => ({ ...n, label }));
  }

  save(): void {
    this._dialogRef.close(this.node());
  }

  cancel(): void {
    this._dialogRef.close();
  }

  get actionType(): string {
    return this.node().actionType || this.node().type || '';
  }
}
