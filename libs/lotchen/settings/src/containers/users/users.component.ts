import { Component, inject } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { UsersApiService } from '@talisoft/api/lotchen-client-api';
import { TasText } from '@talisoft/ui/text';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';

@Component({
  selector: 'settings-users',
  templateUrl: './users.component.html',
  standalone: true,
  imports: [ButtonModule, TasIcon, TasTitle, TasText, TasCard, TasCardHeader],
})
export class UsersComponent {
  private readonly _usersService = inject(UsersApiService);

  public addUserDialog(): void {
    this._usersService.usersControllerAllUsersV1().subscribe((res) => {
      console.log(res);
    });
  }
}

export default UsersComponent;
