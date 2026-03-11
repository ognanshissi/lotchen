import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  output,
} from '@angular/core';
import { NgFor } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { WorkflowNodeDto } from '@talisoft/api/lotchen-client-api';

interface PaletteItem {
  label: string;
  type: string;
  actionType: string;
  icon: string;
  group: string;
}

@Component({
  selector: 'workflow-node-palette',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-node-palette.component.html',
  imports: [NgFor, CdkDrag],
})
export class WorkflowNodePaletteComponent {
  nodeAdded = output<Partial<WorkflowNodeDto>>();

  paletteGroups = [
    {
      title: 'Actions',
      items: [
        {
          label: 'Assigner utilisateur',
          type: 'action',
          actionType: 'assign_user',
          icon: '👤',
        },
        {
          label: 'Assigner équipe',
          type: 'action',
          actionType: 'assign_team',
          icon: '👥',
        },
        {
          label: 'Envoyer email',
          type: 'action',
          actionType: 'send_email',
          icon: '📧',
        },
        {
          label: 'Envoyer SMS',
          type: 'action',
          actionType: 'send_sms',
          icon: '💬',
        },
        {
          label: 'Créer tâche',
          type: 'action',
          actionType: 'create_task',
          icon: '✅',
        },
        {
          label: 'Modifier champ',
          type: 'action',
          actionType: 'update_field',
          icon: '✏️',
        },
      ],
    },
    {
      title: 'Logique',
      items: [
        {
          label: 'Attendre',
          type: 'wait',
          actionType: 'wait_duration',
          icon: '⏳',
        },
        {
          label: 'Condition',
          type: 'condition',
          actionType: 'conditional_branch',
          icon: '🔀',
        },
      ],
    },
  ];

  addNode(item: PaletteItem, currentCount: number): void {
    this.nodeAdded.emit({
      type: item.type,
      actionType: item.actionType,
      label: item.label,
      config: {},
      position: currentCount,
    });
  }
}
