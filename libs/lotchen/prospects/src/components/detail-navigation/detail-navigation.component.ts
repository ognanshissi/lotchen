import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { CallerService } from '@lotchen/lotchen/common';
import { FindContactByIdQueryResponse } from '@talisoft/api/lotchen-client-api';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { map } from 'rxjs';

@Component({
  selector: 'prospects-detail-navigation',
  templateUrl: './detail-navigation.component.html',
  standalone: true,
  imports: [RouterOutlet, TasCard, TasIcon, ButtonModule],
})
export class DetailNavigationComponent {
  private readonly _callerService = inject(CallerService);
  private readonly _activatedRoute = inject(ActivatedRoute);

  public contact = toSignal<FindContactByIdQueryResponse>(
    this._activatedRoute.data.pipe(map((data) => data['contact']))
  );

  public callerIsOpened = this._callerService.isCallerOpened;
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
