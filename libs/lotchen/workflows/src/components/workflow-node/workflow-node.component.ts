import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  computed,
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { WorkflowNodeDto } from '@talisoft/api/lotchen-client-api';

@Component({
  selector: 'workflow-node',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-node.component.html',
  imports: [NgClass, NgIf, CdkDrag],
})
export class WorkflowNodeComponent {
  node = input.required<WorkflowNodeDto>();
  selected = input(false);
  nodeClick = output<WorkflowNodeDto>();
  nodeDelete = output<WorkflowNodeDto>();

  icon = computed(() =>
    this.getIcon(this.node().actionType || this.node().type)
  );

  private getIcon(type: string): string {
    const icons: Record<string, string> = {
      trigger: '⚡',
      assign_user: '👤',
      assign_team: '👥',
      send_email: '📧',
      send_sms: '💬',
      create_task: '✅',
      update_field: '✏️',
      wait_duration: '⏳',
      conditional_branch: '🔀',
      condition: '🔀',
    };
    return icons[type] || '⚙️';
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
