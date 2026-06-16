import { Component, inject, OnInit, signal } from '@angular/core';
import {
  TaskFilterData,
  TaskSearchComponent,
} from '../../components/task-search/task-search.component';
import { DatePipe } from '@angular/common';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';
import { TableConfig, TasTable } from '@talisoft/ui/table';
import { Severity, TasTag } from '@talisoft/ui/tag';
import { TimeagoPipe } from '@talisoft/ui/timeago';
import { TasksApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';

@Component({
  selector: 'tasks-task-list',
  standalone: true,
  imports: [
    ButtonModule,
    TasCard,
    TasCardHeader,
    TasIcon,
    TasText,
    TasTitle,
    TasTable,
    TasTag,
    TimeagoPipe,
    TaskSearchComponent,
    DatePipe,
  ],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  private readonly _tasksApi = inject(TasksApiService);
  private readonly _snackbar = inject(SnackbarService);

  public tasks = signal<any[]>([]);
  public isLoading = signal(false);
  private _filterData: TaskFilterData = {};

  public tableConfig: TableConfig = {
    property: 'id',
    pagination: {
      serverSide: false,
      pageIndex: 0,
      pageSize: 10,
      pageSizeOptions: [],
    },
  };

  public ngOnInit(): void {
    this.loadTasks();
  }

  public onFilterChange(filterData: TaskFilterData): void {
    this._filterData = filterData;
    this.loadTasks();
  }

  public loadTasks(): void {
    this.isLoading.set(true);
    const { taskType, completed } = this._filterData;

    this._tasksApi
      .tasksControllerFindAllTasksV1(
        '',
        '',
        (taskType as any) ?? '',
        completed as any
      )
      .subscribe({
        next: (tasks) => {
          const search = (this._filterData.searchTerm ?? '').toLowerCase();
          const filtered = search
            ? tasks.filter(
                (t) =>
                  t.title?.toLowerCase().includes(search) ||
                  t.description?.toLowerCase().includes(search)
              )
            : tasks;
          this.tasks.set(filtered);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this._snackbar.error('Erreur', 'Impossible de charger les tâches');
        },
      });
  }

  public completeTask(taskId: string): void {
    this._tasksApi.tasksControllerCompleteTaskV1(taskId).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Tâche marquée comme complétée');
        this.loadTasks();
      },
      error: () =>
        this._snackbar.error('Erreur', 'Impossible de compléter la tâche'),
    });
  }

  public deleteTask(taskId: string): void {
    this._tasksApi.tasksControllerDeleteTaskV1(taskId).subscribe({
      next: () => {
        this._snackbar.success('Succès', 'Tâche supprimée');
        this.loadTasks();
      },
      error: () =>
        this._snackbar.error('Erreur', 'Impossible de supprimer la tâche'),
    });
  }

  public taskTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'follow up': 'Suivi',
      'call reminder': 'Rappel appel',
      other: 'Autre',
    };
    return labels[type] ?? type;
  }

  public taskTypeColor(type: string): Severity {
    const colors: Record<string, Severity> = {
      'follow up': 'info',
      'call reminder': 'warning',
      other: 'secondary',
    };
    return colors[type] ?? 'secondary';
  }

  public openQuickAddTask(): void {
    console.log('Show Quick add dialog');
  }
}

export default TaskListComponent;
