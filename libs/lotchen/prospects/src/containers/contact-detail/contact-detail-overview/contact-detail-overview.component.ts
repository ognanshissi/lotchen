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
import {
  ContactsApiService,
  FindContactByIdQueryResponse,
  UpdateContactStatusCommandRequestStatusEnum,
} from '@talisoft/api/lotchen-client-api';
import { TasCard } from '@talisoft/ui/card';
import { TasSummaryField } from '@talisoft/ui/summary-field';
import { DynamicFieldsSummaryComponent } from '@lotchen/lotchen/common/components';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { map, Observable } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'prospects-contact-detail-overview',
  templateUrl: './contact-detail-overview.component.html',
  standalone: true,
  imports: [TasSummaryField, TasCard, DatePipe, DynamicFieldsSummaryComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailOverviewComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _contactApi = inject(ContactsApiService);
  private readonly _snackbarService = inject(SnackbarService);
  private readonly _router = inject(Router);

  public contact = toSignal(
    (this._activatedRoute?.parent?.data as Observable<Data>).pipe(
      map(
        (data) =>
          data['contact'] as FindContactByIdQueryResponse & Record<string, any>
      )
    )
  );

  public statusPipeline = [
    { value: 'New', label: 'Nouveau' },
    { value: 'Contacted', label: 'Contacté' },
    { value: 'Interested', label: 'Intéressé' },
    { value: 'Qualified', label: 'Qualifié' },
    { value: 'ProposalSent', label: 'Proposition envoyée' },
    { value: 'Negotiation', label: 'Négociation' },
    { value: 'ConvertedToClient', label: 'Converti en client' },
  ];

  public secondaryStatuses = [
    { value: 'Lost', label: 'Perdu' },
    { value: 'OnHold', label: 'En attente' },
  ];

  public showStatusHistory = signal(false);

  public updatingStatus = signal(false);

  public assignedAgent = computed(() => {
    const contact = this.contact() as any;
    // Use createdByInfo as fallback if no explicit assignment
    const info = contact?.assignedToUserId;
    if (!info) return 'Non assigné';
    return `${info.firstName ?? ''} ${info.lastName ?? ''}`.trim();
  });

  public customFields = computed(() => {
    return (this.contact() as any)?.customFields ?? {};
  });

  public tagsDisplay = computed(() => {
    const tags = (this.contact() as any)?.tags;
    return tags?.length ? tags.join(', ') : '';
  });

  public onStatusChange(newStatus: string): void {
    const contactId = this.contact()?.id;
    if (!contactId || this.contact()?.status === newStatus) return;

    this.updatingStatus.set(true);

    this._contactApi
      .contactsControllerUpdateContactStatusV1(contactId, {
        status: newStatus as UpdateContactStatusCommandRequestStatusEnum,
      })
      .subscribe({
        next: () => {
          this._snackbarService.success(
            'Succès',
            'Le statut du contact a été mis à jour'
          );
          this.updatingStatus.set(false);
          this._refreshPage(contactId);
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
    const contactId = this.contact()?.id;
    if (!contactId) return;

    this._contactApi
      .contactsControllerUpdateContactV1(contactId, {
        [event.field]: event.value,
      })
      .subscribe({
        next: () => {
          this._snackbarService.success(
            'Succès',
            'Le contact a été mis à jour'
          );
          this._refreshPage(contactId);
        },
        error: () => {
          this._snackbarService.error(
            'Erreur',
            'La mise à jour du contact a échoué'
          );
        },
      });
  }

  public onCustomFieldSaved(event: { field: string; value: string }): void {
    const contactId = this.contact()?.id;
    if (!contactId) return;

    const updatedCustomFields = {
      ...this.customFields(),
      [event.field]: event.value,
    };

    this._contactApi
      .contactsControllerUpdateContactV1(contactId, {
        customFields: updatedCustomFields,
      } as any)
      .subscribe({
        next: () => {
          this._snackbarService.success(
            'Succès',
            'Champ personnalisé mis à jour'
          );
          this._refreshPage(contactId);
        },
        error: () => {
          this._snackbarService.error(
            'Erreur',
            'La mise à jour du champ personnalisé a échoué'
          );
        },
      });
  }

  private _refreshPage(contactId: string): void {
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate(['/portal/contacts', contactId, 'overview']);
    });
  }
}
