import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Data, Router } from '@angular/router';
import {
  ContactsApiService,
  FindContactByIdQueryResponse,
} from '@talisoft/api/lotchen-client-api';
import { TasCard } from '@talisoft/ui/card';
import { TasSummaryField } from '@talisoft/ui/summary-field';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'prospects-contact-detail-overview',
  templateUrl: './contact-detail-overview.component.html',
  standalone: true,
  imports: [TasSummaryField, TasCard],
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
  ];

  public assignedAgent = computed(() => {
    const info = (this.contact() as any)?.createdByInfo;
    if (!info) return '';
    return `${info.firstName ?? ''} ${info.lastName ?? ''}`.trim();
  });

  public tagsDisplay = computed(() => {
    const tags = (this.contact() as any)?.tags;
    return tags?.length ? tags.join(', ') : '';
  });

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
          // Re-navigate to refresh resolver data
          this._router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this._router.navigate([
                '/portal/contacts',
                contactId,
                'overview',
              ]);
            });
        },
        error: () => {
          this._snackbarService.error(
            'Erreur',
            'La mise à jour du contact a échoué'
          );
        },
      });
  }
}
