import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewEncapsulation,
} from '@angular/core';
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
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailOverviewComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);

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
}
