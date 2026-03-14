import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { WorkflowExecutionsApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasSpinner } from '@talisoft/ui/spinner';

@Component({
  selector: 'workflow-execution-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-execution-list.component.html',
  imports: [
    DatePipe,
    SlicePipe,
    TasCard,
    TasCardHeader,
    TasTitle,
    TasText,
    ButtonModule,
    TasIcon,
    TasSpinner,
  ],
})
export class WorkflowExecutionListComponent implements OnInit {
  private readonly _executionsApi = inject(WorkflowExecutionsApiService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _snackbar = inject(SnackbarService);

  executions = signal<any[]>([]);
  isLoading = signal(false);
  workflowId = signal<string | null>(null);
  filterStatus = signal<string | undefined>(undefined);

  filters = [
    { label: 'Toutes', value: undefined as string | undefined },
    { label: 'En cours', value: 'running' as string | undefined },
    { label: 'Terminées', value: 'completed' as string | undefined },
    { label: 'Échouées', value: 'failed' as string | undefined },
  ];

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.workflowId.set(id);
    }
    this.loadExecutions();
  }

  loadExecutions(): void {
    this.isLoading.set(true);
    this._executionsApi
      .workflowExecutionsControllerFindAllV1(
        this.workflowId() || undefined,
        this.filterStatus()
      )
      .subscribe({
        next: (data) => {
          this.executions.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this._snackbar.error(
            'Erreur',
            'Erreur lors du chargement des exécutions'
          );
          this.isLoading.set(false);
        },
      });
  }

  setFilter(status: string | undefined): void {
    this.filterStatus.set(status);
    this.loadExecutions();
  }

  viewDetail(executionId: string): void {
    this._router.navigate([
      `/portal/automation-workflows/executions/${executionId}`,
    ]);
  }

  goBack(): void {
    this._router.navigate(['/portal/automation-workflows']);
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'feather:check-circle';
      case 'running':
        return 'feather:loader';
      case 'failed':
        return 'feather:x-circle';
      case 'cancelled':
        return 'feather:slash';
      default:
        return 'feather:clock';
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

  getDuration(exec: any): string {
    if (!exec.completedAt) return '-';
    const ms =
      new Date(exec.completedAt).getTime() - new Date(exec.createdAt).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${Math.round(ms / 1000)}s`;
  }
}

export default WorkflowExecutionListComponent;
