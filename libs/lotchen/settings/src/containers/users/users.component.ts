import { Component, inject } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { UsersApiService } from '@talisoft/api/lotchen-client-api';
import { TasText } from '@talisoft/ui/text';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import {
  RowSelectionItem,
  RowSelectionMaster,
  TableItemActionDirective,
  TasTable,
} from '@talisoft/ui/table';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TimeagoPipe } from '@talisoft/ui/timeago';

@Component({
  selector: 'settings-users',
  templateUrl: './users.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    TasIcon,
    TasTitle,
    TasText,
    TasCard,
    TasCardHeader,
    TableItemActionDirective,
    TasTable,
    RouterLink,
    RowSelectionMaster,
    RowSelectionItem,
    TimeagoPipe,
  ],
})
export class UsersComponent {
  private readonly _usersService = inject(UsersApiService);

  public users = toSignal(this._usersService.usersControllerAllUsersV1());

  public addUserDialog(): void {
    this._usersService.usersControllerAllUsersV1().subscribe((res) => {
      console.log(res);
    });
  }
}

export default UsersComponent;
