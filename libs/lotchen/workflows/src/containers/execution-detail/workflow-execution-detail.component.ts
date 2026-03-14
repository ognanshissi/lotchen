import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { WorkflowExecutionsApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasSpinner } from '@talisoft/ui/spinner';

@Component({
  selector: 'workflow-execution-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-execution-detail.component.html',
  imports: [
    DatePipe,
    TasCard,
    TasCardHeader,
    TasTitle,
    ButtonModule,
    TasIcon,
    TasSpinner,
  ],
})
export class WorkflowExecutionDetailComponent implements OnInit {
  private readonly _executionsApi = inject(WorkflowExecutionsApiService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _snackbar = inject(SnackbarService);

  execution = signal<any | null>(null);
  isLoading = signal(false);

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('executionId');
    if (id) {
      this.loadExecution(id);
    }
  }

  loadExecution(id: string): void {
    this.isLoading.set(true);
    this._executionsApi.workflowExecutionsControllerFindByIdV1(id).subscribe({
      next: (data) => {
        this.execution.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this._snackbar.error(
          'Erreur',
          "Erreur lors du chargement de l'exécution"
        );
        this.isLoading.set(false);
      },
    });
  }

  retryStep(nodeId: string): void {
    const exec = this.execution();
    if (!exec) return;
    this._executionsApi
      .workflowExecutionsControllerRetryStepV1(exec._id, { nodeId })
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Étape relancée');
          this.loadExecution(exec._id);
        },
        error: () =>
          this._snackbar.error('Erreur', 'Erreur lors de la relance'),
      });
  }

  skipStep(nodeId: string): void {
    const exec = this.execution();
    if (!exec) return;
    this._executionsApi
      .workflowExecutionsControllerSkipStepV1(exec._id, { nodeId })
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Étape ignorée');
          this.loadExecution(exec._id);
        },
        error: () =>
          this._snackbar.error('Erreur', "Erreur lors de l'ignorance"),
      });
  }

  cancel(): void {
    const exec = this.execution();
    if (!exec) return;
    this._executionsApi
      .workflowExecutionsControllerCancelV1(exec._id)
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Exécution annulée');
          this.loadExecution(exec._id);
        },
        error: () =>
          this._snackbar.error('Erreur', "Erreur lors de l'annulation"),
      });
  }

  goBack(): void {
    this._router.navigate(['/portal/automation-workflows']);
  }

  getStepIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'feather:check-circle';
      case 'failed':
        return 'feather:x-circle';
      case 'running':
        return 'feather:loader';
      case 'skipped':
        return 'feather:skip-forward';
      default:
        return 'feather:circle';
    }
  }

  getStepIconColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-emerald-500';
      case 'failed':
        return 'text-red-500';
      case 'running':
        return 'text-blue-500';
      case 'skipped':
        return 'text-gray-400';
      default:
        return 'text-gray-300';
    }
  }

  getStepBgClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 border-emerald-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      case 'skipped':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      running: 'En cours',
      completed: 'Terminé',
      failed: 'Échoué',
      cancelled: 'Annulé',
      paused: 'En pause',
    };
    return labels[status] || status;
  }
}

export default WorkflowExecutionDetailComponent;
