import { Component, inject } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard } from '@talisoft/ui/card';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FindContactByIdQueryResponse } from '@talisoft/api/lotchen-client-api';
import { TasSummaryField } from '@talisoft/ui/summary-field';

@Component({
  selector: 'prospects-contact-detail',
  templateUrl: './contact-detail.component.html',
  standalone: true,
  imports: [ButtonModule, TasCard, TasSummaryField],
})
export class ContactDetailComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);

  public contact = toSignal<FindContactByIdQueryResponse>(
    this._activatedRoute.data.pipe(map((data) => data['contact']))
  );
}

export default ContactDetailComponent;
