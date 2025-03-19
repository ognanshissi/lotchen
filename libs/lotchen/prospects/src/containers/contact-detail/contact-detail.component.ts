import { Component, inject } from '@angular/core';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard } from '@talisoft/ui/card';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FindContactByIdQueryResponse } from '@talisoft/api/lotchen-client-api';
import { CallerComponent } from '@lotchen/lotchen/common';
import { Dialog } from '@angular/cdk/dialog';
import { ca } from 'date-fns/locale';

@Component({
  selector: 'prospects-contact-detail',
  templateUrl: './contact-detail.component.html',
  standalone: true,
  imports: [TasIcon, ButtonModule, TasCard],
})
export class ContactDetailComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _dialog = inject(Dialog);

  public contact = toSignal<FindContactByIdQueryResponse>(
    this._activatedRoute.data.pipe(map((data) => data['contact']))
  );

  /**
   * Open caller dialog
   */
  public triggerCaller(): void {
    this._dialog.open(CallerComponent, {
      hasBackdrop: false,
      data: {
        id: this.contact()?.id,
        clientName: `${
          this.contact()?.firstName
        } ${this.contact()?.lastName?.toUpperCase()}`,
        mobileNumber: this.contact()?.mobileNumber,
      },
    });
  }
}

export default ContactDetailComponent;
