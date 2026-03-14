import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import {
  CdkDropList,
  CdkDrag,
  moveItemInArray,
  CdkDragDrop,
} from '@angular/cdk/drag-drop';
import {
  WorkflowTemplatesApiService,
  WorkflowExecutionsApiService,
  WorkflowNodeDto,
  WorkflowTriggerDto,
  WorkflowTriggerDtoTypeEnum,
} from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { WorkflowNodeComponent } from '../../components/workflow-node/workflow-node.component';
import { WorkflowNodePaletteComponent } from '../../components/workflow-node-palette/workflow-node-palette.component';
import { WorkflowTriggerConfigComponent } from '../../components/workflow-trigger-config/workflow-trigger-config.component';
import {
  WorkflowNodeConfigDrawerComponent,
  NodeConfigDialogData,
} from '../../components/workflow-node-config-drawer/workflow-node-config-drawer.component';
import { randomUUID } from '../../utils/uuid.util';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';

@Component({
  selector: 'workflow-builder',
  standalone: true,
  templateUrl: './workflow-builder.component.html',
  imports: [
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    CdkDropList,
    WorkflowNodeComponent,
    WorkflowNodePaletteComponent,
    WorkflowTriggerConfigComponent,
    ButtonModule,
    TasIcon,
  ],
})
export class WorkflowBuilderComponent implements OnInit {
  private readonly _workflowsApi = inject(WorkflowTemplatesApiService);
  private readonly _executionsApi = inject(WorkflowExecutionsApiService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);

  workflowId = signal<string | null>(null);
  workflowName = signal('Nouveau workflow');
  workflowStatus = signal('draft');
  trigger = signal<WorkflowTriggerDto>({
    type: WorkflowTriggerDtoTypeEnum.Manual,
    config: {},
  });
  nodes = signal<WorkflowNodeDto[]>([]);
  selectedNodeId = signal<string | null>(null);
  isSaving = signal(false);
  isLoading = signal(false);

  isEditing = computed(() => !!this.workflowId());

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.workflowId.set(id);
      this.loadWorkflow(id);
    }
  }

  loadWorkflow(id: string): void {
    this.isLoading.set(true);
    this._workflowsApi.workflowTemplatesControllerFindByIdV1(id).subscribe({
      next: (wf: any) => {
        this.workflowName.set(wf.name);
        this.workflowStatus.set(wf.status);
        this.trigger.set(wf.trigger || { type: 'manual', config: {} });
        this.nodes.set(
          (wf.nodes || []).sort((a: any, b: any) => a.position - b.position)
        );
        this.isLoading.set(false);
      },
      error: () => {
        this._snackbar.error('Erreur', 'Erreur lors du chargement du workflow');
        this.isLoading.set(false);
      },
    });
  }

  onTriggerChange(trigger: WorkflowTriggerDto): void {
    this.trigger.set(trigger);
  }

  onNodeAdded(partial: Partial<WorkflowNodeDto>): void {
    const node: WorkflowNodeDto = {
      nodeId: randomUUID(),
      type: partial.type || 'action',
      actionType: partial.actionType,
      label: partial.label || 'Nouvelle étape',
      config: partial.config || {},
      position: this.nodes().length,
    };
    this.nodes.update((ns) => [...ns, node]);
  }

  onNodeClick(node: WorkflowNodeDto): void {
    this.selectedNodeId.set(node.nodeId || null);
    const ref = this._dialog.open<WorkflowNodeDto, NodeConfigDialogData>(
      WorkflowNodeConfigDrawerComponent,
      {
        data: { node },
        panelClass: 'node-config-panel',
      }
    );
    ref.closed.subscribe((updated) => {
      if (updated) {
        this.nodes.update((ns) =>
          ns.map((n) => (n.nodeId === updated.nodeId ? updated : n))
        );
      }
      this.selectedNodeId.set(null);
    });
  }

  onNodeDelete(node: WorkflowNodeDto): void {
    this.nodes.update((ns) =>
      ns
        .filter((n) => n.nodeId !== node.nodeId)
        .map((n, i) => ({ ...n, position: i }))
    );
  }

  onDrop(event: CdkDragDrop<WorkflowNodeDto[]>): void {
    const arr = [...this.nodes()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.nodes.set(arr.map((n, i) => ({ ...n, position: i })));
  }

  save(): void {
    this.isSaving.set(true);
    const payload = {
      name: this.workflowName(),
      trigger: this.trigger(),
      nodes: this.nodes(),
      edges: [],
    };

    const obs = this.isEditing()
      ? this._workflowsApi.workflowTemplatesControllerUpdateV1(
          this.workflowId()!,
          payload
        )
      : this._workflowsApi.workflowTemplatesControllerCreateV1(payload);

    obs.subscribe({
      next: (result: any) => {
        this._snackbar.success('Succès', 'Workflow sauvegardé');
        this.isSaving.set(false);
        if (!this.isEditing() && result?._id) {
          this._router.navigate([
            `/portal/automation-workflows/${result._id}/edit`,
          ]);
        }
      },
      error: () => {
        this._snackbar.error('Erreur', 'Erreur lors de la sauvegarde');
        this.isSaving.set(false);
      },
    });
  }

  activate(): void {
    if (!this.workflowId()) {
      this._snackbar.error('Erreur', "Sauvegardez d'abord le workflow");
      return;
    }
    this._workflowsApi
      .workflowTemplatesControllerActivateV1(this.workflowId()!)
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Workflow activé');
          this.workflowStatus.set('active');
        },
        error: (err: any) => {
          this._snackbar.error(
            'Erreur',
            err?.error?.message || "Erreur lors de l'activation"
          );
        },
      });
  }

  testRun(): void {
    if (!this.workflowId()) {
      this._snackbar.error('Erreur', "Sauvegardez d'abord le workflow");
      return;
    }
    this._executionsApi
      .workflowExecutionsControllerTestRunV1({
        workflowTemplateId: this.workflowId()!,
        targetEntityId: 'f9d22db0-247d-4279-9622-e5279eeb06a3',
        targetEntityType: 'Contact',
      })
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Test run lancé');
        },
        error: () => {
          this._snackbar.error('Erreur', 'Erreur lors du test run');
        },
      });
  }

  goBack(): void {
    this._router.navigate(['/portal/automation-workflows']);
  }

  isNodeSelected(node: WorkflowNodeDto): boolean {
    return this.selectedNodeId() === node.nodeId;
  }
}

export default WorkflowBuilderComponent;
