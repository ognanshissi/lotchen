import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  computed,
} from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { WorkflowNodeDto } from '@talisoft/api/lotchen-client-api';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';

@Component({
  selector: 'workflow-node',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-node.component.html',
  imports: [CdkDrag, TasIcon, ButtonModule],
})
export class WorkflowNodeComponent {
  node = input.required<WorkflowNodeDto>();
  selected = input(false);
  nodeClick = output<WorkflowNodeDto>();
  nodeDelete = output<WorkflowNodeDto>();

  icon = computed(() =>
    this.getIcon(this.node().actionType || this.node().type)
  );
  accentColor = computed(() =>
    this.getAccentColor(this.node().actionType || this.node().type)
  );

  private getIcon(type: string): string {
    const icons: Record<string, string> = {
      trigger: 'feather:zap',
      assign_user: 'feather:user',
      assign_team: 'feather:users',
      send_email: 'feather:mail',
      send_sms: 'feather:message-circle',
      create_task: 'feather:check-square',
      update_field: 'feather:edit-3',
      wait_duration: 'feather:clock',
      conditional_branch: 'feather:git-branch',
      condition: 'feather:git-branch',
    };
    return icons[type] || 'feather:settings';
  }

  private getAccentColor(type: string): string {
    const colors: Record<string, string> = {
      trigger: 'bg-amber-100 text-amber-600',
      assign_user: 'bg-blue-100 text-blue-600',
      assign_team: 'bg-indigo-100 text-indigo-600',
      send_email: 'bg-emerald-100 text-emerald-600',
      send_sms: 'bg-teal-100 text-teal-600',
      create_task: 'bg-violet-100 text-violet-600',
      update_field: 'bg-orange-100 text-orange-600',
      wait_duration: 'bg-gray-100 text-gray-600',
      conditional_branch: 'bg-rose-100 text-rose-600',
      condition: 'bg-rose-100 text-rose-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  }

  getNodeTypeLabel(): string {
    const type = this.node().actionType || this.node().type;
    const labels: Record<string, string> = {
      trigger: 'Déclencheur',
      assign_user: 'Assigner utilisateur',
      assign_team: 'Assigner équipe',
      send_email: 'Envoyer email',
      send_sms: 'Envoyer SMS',
      create_task: 'Créer tâche',
      update_field: 'Modifier champ',
      wait_duration: 'Attendre',
      conditional_branch: 'Condition',
    };
    return labels[type] || type;
  }

  onClick(): void {
    this.nodeClick.emit(this.node());
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.nodeDelete.emit(this.node());
  }
}
