import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTag } from '@talisoft/ui/tag';
import { map } from 'rxjs';
import { MenuItem } from '@lotchen/lotchen/common/models/menu-item';
import { SnackbarService } from '@talisoft/ui/snackbar';
import {
  ClientDetailDto,
  ClientsApiService,
} from '../../services/clients-api.service';

@Component({
  selector: 'clients-detail-navigation',
  templateUrl: './detail-navigation.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    TasCard,
    TasIcon,
    ButtonModule,
    RouterLink,
    RouterLinkActive,
    TasTag,
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
export class ClientDetailNavigationComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _clientsApi = inject(ClientsApiService);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _router = inject(Router);

  public menuItems: MenuItem[] = [
    {
      label: "Vue d'ensemble",
      icon: 'feather:info',
      route: 'overview',
      active: true,
    },
    {
      label: 'Activités',
      icon: 'feather:activity',
      route: 'activities',
      active: true,
    },
    {
      label: 'Produits & Polices',
      icon: 'feather:package',
      route: 'products',
      active: true,
    },
    {
      label: 'Documents',
      icon: 'feather:folder',
      route: 'documents',
      active: true,
    },
  ];

  public client = toSignal(
    this._activatedRoute.data.pipe(
      map((data) => data['client'] as ClientDetailDto)
    )
  );

  public kycStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      NotStarted: 'Non démarré',
      InProgress: 'En cours',
      Verified: 'Vérifié',
      Rejected: 'Rejeté',
      Expired: 'Expiré',
    };
    return labels[status ?? ''] ?? status ?? '';
  }

  public statusLabel(status?: string): string {
    const labels: Record<string, string> = {
      Active: 'Actif',
      Inactive: 'Inactif',
      Suspended: 'Suspendu',
      Closed: 'Fermé',
    };
    return labels[status ?? ''] ?? status ?? '';
  }
}
