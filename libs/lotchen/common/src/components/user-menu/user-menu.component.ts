import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { Menu, MenuItem, TasMenuTrigger } from '@talisoft/ui/menu';
import { TasIcon } from '@talisoft/ui/icon';
import { AuthenticationService } from '../../services/authentication.service';
import { GetMeQueryResponse } from '@talisoft/api/lotchen-client-api';

@Component({
  selector: 'common-user-menu',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Menu, MenuItem, TasMenuTrigger, TasIcon],
  template: `
    <!-- Trigger button -->
    <button
      TasMenuTrigger
      [panel]="profileMenu"
      class="flex items-center gap-2 rounded-full focus:outline-none"
      title="Mon profil"
    >
      <span
        class=" bg-gray-200 rounded-full p-2 hover:bg-gray-300 flex items-center justify-center  text-sm font-semibold text-gray-200"
        style="background-color: rgb(var(--tas-color-primary))"
      >
        @if (initials()) {
        {{ initials() }}
        } @else {
        <tas-icon iconName="feather:user" iconSize="sm"></tas-icon>
        }
      </span>
    </button>

    <!-- Dropdown panel -->
    <ng-template #profileMenu>
      <tas-menu>
        <!-- User info header -->
        <div class="border-b border-gray-100 px-4 py-3">
          <p class="text-sm font-semibold text-gray-800">
            {{ user()?.firstName }} {{ user()?.lastName }}
          </p>
          <p class="truncate text-xs text-gray-400">{{ user()?.email }}</p>
        </div>

        <!-- Actions -->
        <tas-menu-item (click)="navigate('/portal/profile')">
          <span class="flex items-center gap-3 text-sm text-gray-700">
            <tas-icon iconName="feather:user" iconSize="sm"></tas-icon>
            Profil
          </span>
        </tas-menu-item>

        <tas-menu-item (click)="navigate('/settings')">
          <span class="flex items-center gap-3 text-sm text-gray-700">
            <tas-icon iconName="feather:settings" iconSize="sm"></tas-icon>
            Paramètres
          </span>
        </tas-menu-item>

        <!-- Divider + logout -->
        <div class="my-1 border-t border-gray-100"></div>

        <tas-menu-item (click)="logout()">
          <span class="flex items-center gap-3 text-sm text-functional-error">
            <tas-icon iconName="feather:log-out" iconSize="sm"></tas-icon>
            Déconnexion
          </span>
        </tas-menu-item>
      </tas-menu>
    </ng-template>
  `,
})
export class UserMenuComponent {
  private readonly _auth = inject(AuthenticationService);
  private readonly _router = inject(Router);

  readonly user = computed(
    () => this._auth.connectedUser() as GetMeQueryResponse | null
  );

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '';
    const first = u.firstName?.[0] ?? '';
    const last = u.lastName?.[0] ?? '';
    return (first + last).toUpperCase();
  });

  navigate(path: string): void {
    this._router.navigate([path]);
  }

  logout(): void {
    this._auth.logout();
  }
}
