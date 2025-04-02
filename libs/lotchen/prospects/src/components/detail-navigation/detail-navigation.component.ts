import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CallerService } from '@lotchen/lotchen/common';
import { FindContactByIdQueryResponse } from '@talisoft/api/lotchen-client-api';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { map } from 'rxjs';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'prospects-detail-navigation',
  templateUrl: './detail-navigation.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    TasCard,
    TasIcon,
    ButtonModule,
    RouterLink,
    RouterLinkActive,
  ],
  styles: [
    `
      .is-link-active {
        background-color: rgba(var(--tas-color-primary), 0.2);
        @apply text-primary;
      }
    `,
  ],
})
export class DetailNavigationComponent {
  private readonly _callerService = inject(CallerService);
  private readonly _activatedRoute = inject(ActivatedRoute);

  public menuItems: MenuItem[] = [
    {
      label: 'Overview',
      icon: 'info',
      route: 'overview',
      active: true,
    },
    {
      label: 'Activities',
      icon: 'feather:activity',
      route: 'activities',
      active: true,
    },
    {
      label: 'Notes',
      icon: 'note',
      route: 'notes',
      active: true,
    },
    {
      label: 'Conversations',
      icon: 'feather:message-circle',
      route: 'conversations',
      active: true,
    },
    {
      label: 'Documents',
      icon: 'feather:folder',
      route: 'documents',
      active: true,
    },
  ];

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
