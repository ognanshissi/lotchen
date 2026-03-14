import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  output,
} from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { WorkflowNodeDto } from '@talisoft/api/lotchen-client-api';
import { TasIcon } from '@talisoft/ui/icon';

interface PaletteItem {
  label: string;
  type: string;
  actionType: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'workflow-node-palette',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-node-palette.component.html',
  imports: [CdkDrag, TasIcon],
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
          icon: 'feather:user',
          color: 'text-blue-500',
        },
        {
          label: 'Assigner équipe',
          type: 'action',
          actionType: 'assign_team',
          icon: 'feather:users',
          color: 'text-indigo-500',
        },
        {
          label: 'Envoyer email',
          type: 'action',
          actionType: 'send_email',
          icon: 'feather:mail',
          color: 'text-emerald-500',
        },
        {
          label: 'Envoyer SMS',
          type: 'action',
          actionType: 'send_sms',
          icon: 'feather:message-circle',
          color: 'text-teal-500',
        },
        {
          label: 'Créer tâche',
          type: 'action',
          actionType: 'create_task',
          icon: 'feather:check-square',
          color: 'text-violet-500',
        },
        {
          label: 'Modifier champ',
          type: 'action',
          actionType: 'update_field',
          icon: 'feather:edit-3',
          color: 'text-orange-500',
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
          icon: 'feather:clock',
          color: 'text-gray-500',
        },
        {
          label: 'Condition',
          type: 'condition',
          actionType: 'conditional_branch',
          icon: 'feather:git-branch',
          color: 'text-rose-500',
        },
      ],
    },
  ];

  addNode(item: PaletteItem): void {
    this.nodeAdded.emit({
      type: item.type,
      actionType: item.actionType,
      label: item.label,
      config: {},
      position: 0,
    });
  }
}
