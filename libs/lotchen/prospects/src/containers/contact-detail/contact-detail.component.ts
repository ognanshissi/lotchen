import { Component, inject } from '@angular/core';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard } from '@talisoft/ui/card';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FindContactByIdQueryResponse } from '@talisoft/api/lotchen-client-api';
import { CallerComponent } from '@lotchen/lotchen/common';

@Component({
  selector: 'prospects-contact-detail',
  templateUrl: './contact-detail.component.html',
  standalone: true,
  imports: [TasIcon, ButtonModule, TasCard, CallerComponent],
})
export class ContactDetailComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);

  public contact = toSignal<FindContactByIdQueryResponse>(
    this._activatedRoute.data.pipe(map((data) => data['contact']))
  );

  /**
   * Open caller dialog
   */
  public openCallerDialog(): void {}
}

export default ContactDetailComponent;
