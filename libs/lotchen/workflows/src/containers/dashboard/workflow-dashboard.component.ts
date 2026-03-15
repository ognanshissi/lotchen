import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { WorkflowExecutionsApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasSpinner } from '@talisoft/ui/spinner';
import { DashboardWidgetComponent } from '../../components/dashboard-widget/dashboard-widget.component';

@Component({
  selector: 'workflow-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-dashboard.component.html',
  imports: [
    DatePipe,
    TasCard,
    TasCardHeader,
    TasTitle,
    TasText,
    ButtonModule,
    TasIcon,
    TasSpinner,
    DashboardWidgetComponent,
  ],
})
export class WorkflowDashboardComponent implements OnInit {
  private readonly _executionsApi = inject(WorkflowExecutionsApiService);
  private readonly _router = inject(Router);
  private readonly _snackbar = inject(SnackbarService);

  stats = signal<any | null>(null);
  recentExecutions = signal<any[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);

    this._executionsApi.workflowExecutionsControllerGetDashboardV1().subscribe({
      next: (data) => {
        this.stats.set(data);
      },
      error: () => {
        this._snackbar.error(
          'Erreur',
          'Erreur lors du chargement du tableau de bord'
        );
      },
    });

    this._executionsApi.workflowExecutionsControllerFindAllV1().subscribe({
      next: (data) => {
        this.recentExecutions.set(data.slice(0, 20));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}min`;
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

export default WorkflowDashboardComponent;
