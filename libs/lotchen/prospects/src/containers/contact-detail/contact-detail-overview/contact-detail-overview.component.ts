import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Data } from '@angular/router';
import { FindContactByIdQueryResponse } from '@talisoft/api/lotchen-client-api';
import { TasCard } from '@talisoft/ui/card';
import { TasSummaryField } from '@talisoft/ui/summary-field';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'prospects-contact-detail-overview',
  templateUrl: './contact-detail-overview.component.html',
  standalone: true,
  imports: [TasSummaryField, TasCard],
})
export class ContactDetailOverviewComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);

  public contact = toSignal<FindContactByIdQueryResponse>(
    (this._activatedRoute?.parent?.data as Observable<Data>).pipe(
      map((data) => data['contact'])
    )
  );
}
