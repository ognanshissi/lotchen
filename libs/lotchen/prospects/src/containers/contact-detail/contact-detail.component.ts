import { Component, inject } from '@angular/core';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard } from '@talisoft/ui/card';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FindContactByIdQueryResponse } from '@talisoft/api/lotchen-client-api';
import { CallerService } from '@lotchen/lotchen/common';
import { TasSummaryField } from '@talisoft/ui/summary-field';

@Component({
  selector: 'prospects-contact-detail',
  templateUrl: './contact-detail.component.html',
  standalone: true,
  imports: [TasIcon, ButtonModule, TasCard, TasSummaryField],
})
export class ContactDetailComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _callerService = inject(CallerService);

  public callerIsOpened = this._callerService.isCallerOpened;

  public contact = toSignal<FindContactByIdQueryResponse>(
    this._activatedRoute.data.pipe(map((data) => data['contact']))
  );

  /**
   * Open caller dialog
   */
  public triggerCaller(): void {
    this._callerService.openCaller({
      id: this.contact()?.id ?? '',
      clientName: `${
        this.contact()?.firstName
      } ${this.contact()?.lastName?.toUpperCase()}`,
      mobileNumber: this.contact()?.mobileNumber ?? '',
    });
  }
}

export default ContactDetailComponent;
