import { Component, inject } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserDetailResolver } from '../../../services/user-detail.resolver.service';
import { TasCard } from '@talisoft/ui/card';
import { JsonPipe, NgFor, NgIf } from '@angular/common';

import { TasTable } from '@talisoft/ui/table';
import { AssignPermissionDialogComponent } from '../../../components/assign-permission-dialog.component';
import { SideDrawerService } from '@talisoft/ui/side-drawer';
import { UsersApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';

@Component({
  selector: 'settings-user-edit',
  standalone: true,
  templateUrl: './user-edit.component.html',
  imports: [
    ButtonModule,
    TasIcon,
    TasTitle,
    RouterLink,
    TasCard,
    JsonPipe,
    TabsModule,
    TasTable,
    NgIf,
    NgFor,
  ],
})
export class UserEditComponent {
  private readonly _activeRoute = inject(ActivatedRoute);
  private readonly _sideDrawerService = inject(SideDrawerService);
  private readonly _usersApiService = inject(UsersApiService);
  private readonly _snackbarService = inject(SnackbarService);

  public user = toSignal(
    this._activeRoute.data.pipe(
      map((data) => data['detail'] as UserDetailResolver)
    )
  );

  public assignPermission(): void {
    this._sideDrawerService
      .open(AssignPermissionDialogComponent, {})
      .closed.subscribe((res) => {
        const permissions = res as string[];
        if (permissions && permissions.length > 0) {
          this._assignPermissions(permissions);
        }
      });
  }

  private _assignPermissions(permissions: string[]): void {
    const userId = this.user()?.user?.id;
    if (!userId) return;

    this._usersApiService
      .usersControllerAssignPermissionsToUserV1(userId, {
        permissions,
      })
      .subscribe({
        next: () => {
          this._snackbarService.success(
            'Succès',
            'Les permissions ont été assignées avec succès.'
          );
          // Refresh user data? For now, maybe just reload page or re-fetch.
          // Ideally we should update the signal or re-run resolver logic.
          // Since we are using toSignal with route data, refreshing route might be easiest.
          window.location.reload();
        },
        error: () => {
          this._snackbarService.error(
            'Erreur',
            "Une erreur est survenue lors de l'assignation des permissions."
          );
        },
      });
  }
}

export default UserEditComponent;
