import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { TasCard } from '@talisoft/ui/card';
import { TasSummaryField } from '../../../../../common/src/components/summary-field';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { map, Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ClientsApiService } from '@talisoft/api/lotchen-client-api';

@Component({
  selector: 'clients-detail-overview',
  templateUrl: './client-detail-overview.component.html',
  standalone: true,
  imports: [TasSummaryField, TasCard, DatePipe],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailOverviewComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _clientsApi = inject(ClientsApiService);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _router = inject(Router);

  public client = toSignal(
    (this._activatedRoute?.parent?.data as Observable<Data>).pipe(
      map((data) => data['client'] as any)
    )
  );

  public tagsDisplay = computed(() => {
    const tags = this.client()?.tags;
    return tags?.length ? tags.join(', ') : '';
  });

  public onFieldSaved(event: { field: string; value: any }): void {
    const clientId = this.client()?.id;
    if (!clientId) return;

    this._clientsApi
      .clientControllerUpdateV1(clientId, { [event.field]: event.value } as any)
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Le client a été mis à jour');
          this._refreshPage(clientId);
        },
        error: () => {
          this._snackbar.error('Erreur', 'La mise à jour du client a échoué');
        },
      });
  }

  private _refreshPage(clientId: string): void {
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate(['/portal/clients', clientId, 'overview']);
    });
  }
}

export default ClientDetailOverviewComponent;
