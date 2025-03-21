import { Component, inject } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';
import { RouterLink } from '@angular/router';
import { TasCard } from '@talisoft/ui/card';
import { TasTable } from '@talisoft/ui/table';
import { RolesApiService } from '@talisoft/api/lotchen-client-api';
import { apiResources } from '@talisoft/ui/api-resources';

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
  private readonly _rolesApiService = inject(RolesApiService);

  public roles = apiResources(
    this._rolesApiService.rolesControllerAllRolesV1(
      undefined,
      'id,name,timestamps'
    )
  );

  public openAddDialog(): void {}
}

export default RolesComponent;
