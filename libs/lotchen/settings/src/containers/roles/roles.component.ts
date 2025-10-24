import { Component, inject } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';
import { Router, RouterLink } from '@angular/router';
import { TasCard } from '@talisoft/ui/card';
import { TasTable } from '@talisoft/ui/table';
import {
  CreateRoleCommandResponse,
  RolesApiService,
} from '@talisoft/api/lotchen-client-api';
import { apiResources } from '@talisoft/ui/api-resources';
import { SideDrawerService } from '@talisoft/ui/side-drawer';
import { AddRoleDialogComponent } from '../../components/add-role-dialog/add-role-dialog.component';

@Component({
  selector: 'settings-roles',
  templateUrl: './roles.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    TasIcon,
    TasText,
    TasTitle,
    RouterLink,
    TasCard,
    TasTable,
  ],
})
export class RolesComponent {
  private readonly _sideDrawerService = inject(SideDrawerService);
  private readonly _rolesApiService = inject(RolesApiService);

  private readonly _router = inject(Router);

  public roles = apiResources(
    this._rolesApiService.rolesControllerAllRolesV1(
      undefined,
      'id,name,timestamps, createdAt updatedAt,builtIn'
    )
  );

  public openAddDialog(): void {
    this._sideDrawerService.open(AddRoleDialogComponent, {}).closed.subscribe({
      next: (res) => {
        console.log(res);

        if (res) {
          this._router.navigate([
            '/settings/roles/',
            (res as CreateRoleCommandResponse).id,
            'edit',
          ]);
        }
      },
    });
  }
}

export default RolesComponent;
