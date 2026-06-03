import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  UsersApiService,
  WorkflowNodeDto,
} from '@talisoft/api/lotchen-client-api';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasSelect } from '@talisoft/ui/select';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

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
    FormsModule,
    FormField,
    TasLabel,
    TasInput,
    ButtonModule,
    TasIcon,
    TasSelect,
  ],
})
export class WorkflowNodeConfigDrawerComponent {
  private readonly _dialogRef = inject<DialogRef<WorkflowNodeDto>>(DialogRef);
  private readonly _usersApiService = inject(UsersApiService);
  readonly data = inject<NodeConfigDialogData>(DIALOG_DATA);

  public userList = toSignal(
    this._usersApiService
      .usersControllerAllUsersV1()
      .pipe(
        map((response) =>
          response.map((user) => ({
            id: user.userId,
            fullName: `${user.firstName} ${user.lastName}`,
          }))
        )
      ),
    { initialValue: [] }
  );

  node = signal<WorkflowNodeDto>({
    ...this.data.node,
    config: { ...(this.data.node.config || {}) },
  });

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

  getActionIcon(): string {
    const icons: Record<string, string> = {
      assign_user: 'feather:user',
      assign_team: 'feather:users',
      send_email: 'feather:mail',
      send_sms: 'feather:message-circle',
      create_task: 'feather:check-square',
      update_field: 'feather:edit-3',
      wait_duration: 'feather:clock',
      conditional_branch: 'feather:git-branch',
    };
    return icons[this.actionType] || 'feather:settings';
  }

  getActionLabel(): string {
    const labels: Record<string, string> = {
      assign_user: 'Assigner utilisateur',
      assign_team: 'Assigner équipe',
      send_email: 'Envoyer email',
      send_sms: 'Envoyer SMS',
      create_task: 'Créer tâche',
      update_field: 'Modifier champ',
      wait_duration: 'Attendre',
      conditional_branch: 'Condition',
    };
    return labels[this.actionType] || 'Configuration';
  }

  getAccentColor(): string {
    const colors: Record<string, string> = {
      assign_user: 'bg-blue-100 text-blue-600',
      assign_team: 'bg-indigo-100 text-indigo-600',
      send_email: 'bg-emerald-100 text-emerald-600',
      send_sms: 'bg-teal-100 text-teal-600',
      create_task: 'bg-violet-100 text-violet-600',
      update_field: 'bg-orange-100 text-orange-600',
      wait_duration: 'bg-gray-100 text-gray-600',
      conditional_branch: 'bg-rose-100 text-rose-600',
    };
    return colors[this.actionType] || 'bg-gray-100 text-gray-600';
  }
}
