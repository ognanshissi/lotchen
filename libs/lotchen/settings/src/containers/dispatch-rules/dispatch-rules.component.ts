import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { Severity, TasTag } from '@talisoft/ui/tag';
import { ButtonModule } from '@talisoft/ui/button';
import { TableItemActionDirective, TasTable } from '@talisoft/ui/table';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ConfirmDialogService } from '@talisoft/ui/confirm-dialog';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

export interface DispatchRuleListItem {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'inactive';
  objectType: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'settings-dispatch-rules',
  templateUrl: './dispatch-rules.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    TasTitle,
    TasText,
    TasCard,
    TasIcon,
    TasTag,
    ButtonModule,
    TasTable,
    TableItemActionDirective,
    DragDropModule,
  ],
})
export class DispatchRulesComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _confirmDialog = inject(ConfirmDialogService);

  public rules = signal<DispatchRuleListItem[]>([]);
  public isLoading = signal(false);
  public isReordering = signal(false);

  public ngOnInit(): void {
    this.loadRules();
  }

  public loadRules(): void {
    this.isLoading.set(true);
    this._http.get<DispatchRuleListItem[]>('/api/v1/dispatch-rules').subscribe({
      next: (data) => {
        this.rules.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this._snackbar.error(
          'Erreur',
          'Impossible de charger les règles de dispatch'
        );
        this.isLoading.set(false);
      },
    });
  }

  public getStatusColor(status: string): Severity {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      default:
        return 'info';
    }
  }

  public getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      active: 'Actif',
      inactive: 'Inactif',
    };
    return labels[status] ?? status;
  }

  public getObjectTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      lead: 'Lead',
      case: 'Dossier',
      ticket: 'Ticket',
      service_request: 'Demande de service',
    };
    return labels[type] ?? type;
  }

  public toggleStatus(rule: DispatchRuleListItem): void {
    const action = rule.status === 'active' ? 'deactivate' : 'activate';
    this._http
      .patch(`/api/v1/dispatch-rules/${rule._id}/${action}`, {})
      .subscribe({
        next: () => {
          this._snackbar.success(
            'Succès',
            action === 'activate' ? 'Règle activée' : 'Règle désactivée'
          );
          this.loadRules();
        },
        error: () =>
          this._snackbar.error('Erreur', 'Impossible de modifier le statut'),
      });
  }

  public deleteRule(rule: DispatchRuleListItem): void {
    // this._confirmDialog
    //   .confirm({
    //     title: 'Supprimer la règle',
    //     message: `Êtes-vous sûr de vouloir supprimer "${rule.name}" ?`,
    //     confirmLabel: 'Supprimer',
    //     cancelLabel: 'Annuler',
    //   })
    //   .subscribe((confirmed) => {
    //     if (!confirmed) return;
    //     this._http.delete(`/api/v1/dispatch-rules/${rule._id}`).subscribe({
    //       next: () => {
    //         this._snackbar.success('Succès', 'Règle supprimée');
    //         this.loadRules();
    //       },
    //       error: () =>
    //         this._snackbar.error('Erreur', 'Impossible de supprimer la règle'),
    //     });
    //   });
  }

  public onDrop(event: CdkDragDrop<DispatchRuleListItem[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const updated = [...this.rules()];
    moveItemInArray(updated, event.previousIndex, event.currentIndex);

    // Reassign priority values based on new order
    const reordered = updated.map((rule, index) => ({
      ...rule,
      priority: index,
    }));
    this.rules.set(reordered);

    this.isReordering.set(true);
    this._http
      .patch('/api/v1/dispatch-rules/reorder', {
        items: reordered.map((r) => ({ id: r._id, priority: r.priority })),
      })
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Ordre de priorité sauvegardé');
          this.isReordering.set(false);
        },
        error: () => {
          this._snackbar.error(
            'Erreur',
            'Impossible de mettre à jour les priorités'
          );
          this.isReordering.set(false);
          this.loadRules();
        },
      });
  }
}

export default DispatchRulesComponent;
