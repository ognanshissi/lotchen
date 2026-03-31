import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { TasCard } from '@talisoft/ui/card';
import { TasSummaryField } from '@talisoft/ui/summary-field';
import { DynamicFieldsSummaryComponent } from '@lotchen/lotchen/common/components';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { map, Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { QualifyLeadDialogComponent } from '../../../components/qualify-lead-dialog/qualify-lead-dialog.component';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import {
  ContactsApiService,
  LeadsApiService,
  UpdateContactStatusCommandRequestStatusEnum,
} from '@talisoft/api/lotchen-client-api';

@Component({
  selector: 'leads-detail-overview',
  templateUrl: './lead-detail-overview.component.html',
  standalone: true,
  imports: [
    TasSummaryField,
    TasCard,
    DatePipe,
    ButtonModule,
    TasIcon,
    DynamicFieldsSummaryComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadDetailOverviewComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _snackbarService = inject(SnackbarService);
  private readonly _router = inject(Router);
  private readonly _dialog = inject(Dialog);
  private readonly _leadsApiService = inject(LeadsApiService);
  private readonly _contactsApiService = inject(ContactsApiService);

  public lead = toSignal(
    (this._activatedRoute?.parent?.data as Observable<Data>).pipe(
      map((data) => data['lead'] as Record<string, any>)
    )
  );

  public statusPipeline = [
    { value: 'New', label: 'Nouveau' },
    { value: 'Contacted', label: 'Contacté' },
    { value: 'Interested', label: 'Intéressé' },
    { value: 'Qualified', label: 'Qualifié' },
    { value: 'ConvertedToProspect', label: 'Converti' },
  ];

  public secondaryStatuses = [{ value: 'Disqualified', label: 'Disqualifié' }];

  public showStatusHistory = signal(false);
  public updatingStatus = signal(false);

  public assignedAgent = computed(() => {
    const lead = this.lead();
    const info = lead?.['createdByInfo'];
    if (!info) return '';
    return `${info.firstName ?? ''} ${info.lastName ?? ''}`.trim();
  });

  public customFields = computed(() => {
    return this.lead()?.['customFields'] ?? {};
  });

  public tagsDisplay = computed(() => {
    const tags = this.lead()?.['tags'];
    return tags?.length ? tags.join(', ') : '';
  });

  public hasBantData = computed(() => {
    const lead = this.lead();
    return (
      lead?.['bantBudget'] ||
      lead?.['bantAuthority'] ||
      lead?.['bantNeed'] ||
      lead?.['bantTimeline']
    );
  });

  public onStatusChange(newStatus: string): void {
    const leadId = this.lead()?.['id'];
    if (!leadId || this.lead()?.['status'] === newStatus) return;

    this.updatingStatus.set(true);

    this._contactsApiService
      .contactsControllerUpdateContactStatusV1(leadId, {
        status: newStatus as UpdateContactStatusCommandRequestStatusEnum,
      })
      .subscribe({
        next: () => {
          this._snackbarService.success(
            'Succès',
            'Le statut du lead a été mis à jour'
          );
          this.updatingStatus.set(false);
          this._refreshPage(leadId);
        },
        error: () => {
          this._snackbarService.error(
            'Erreur',
            'La mise à jour du statut a échoué'
          );
          this.updatingStatus.set(false);
        },
      });
  }

  public toggleStatusHistory(): void {
    this.showStatusHistory.update((v) => !v);
  }

  public onFieldSaved(event: { field: string; value: any }): void {
    const leadId = this.lead()?.['id'];
    if (!leadId) return;

    this._leadsApiService
      .leadsControllerUpdateLeadV1(leadId, { [event.field]: event.value })
      .subscribe({
        next: () => {
          this._snackbarService.success('Succès', 'Le lead a été mis à jour');
          this._refreshPage(leadId);
        },
        error: () => {
          this._snackbarService.error(
            'Erreur',
            'La mise à jour du lead a échoué'
          );
        },
      });
  }

  public openQualifyDialog(): void {
    const leadId = this.lead()?.['id'];
    if (!leadId) return;

    const dialogRef = this._dialog.open(QualifyLeadDialogComponent, {
      data: { leadId },
    });

    dialogRef.closed.subscribe((result) => {
      if (result === 'qualified') {
        this._refreshPage(leadId);
      }
    });
  }

  public onCustomFieldSaved(event: { field: string; value: string }): void {
    const leadId = this.lead()?.['id'];
    if (!leadId) return;

    const updatedCustomFields = {
      ...this.customFields(),
      [event.field]: event.value,
    };

    this._leadsApiService
      .leadsControllerUpdateLeadV1(leadId, {
        customFields: updatedCustomFields,
      } as any)
      .subscribe({
        next: () => {
          this._snackbarService.success(
            'Succès',
            'Champ personnalisé mis à jour'
          );
          this._refreshPage(leadId);
        },
        error: () => {
          this._snackbarService.error(
            'Erreur',
            'La mise à jour du champ personnalisé a échoué'
          );
        },
      });
  }

  private _refreshPage(leadId: string): void {
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate(['/portal/leads', leadId, 'overview']);
    });
  }
}
