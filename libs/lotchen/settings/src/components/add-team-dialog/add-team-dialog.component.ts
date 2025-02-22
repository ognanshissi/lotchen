import { Component, inject } from '@angular/core';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasDrawerContent, TasSideDrawer } from '@talisoft/ui/side-drawer';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasSelect } from '@talisoft/ui/select';
import { UsersApiService } from '@talisoft/api/lotchen-client-api';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'settings-add-team-dialog',
  templateUrl: './add-team-dialog.component.html',
  standalone: true,
  imports: [
    FormField,
    TasDrawerContent,
    TasSideDrawer,
    TasTitle,
    TasText,
    TasSelect,
    TasLabel,
  ],
})
export class AddTeamDialogComponent {
  private readonly _userService = inject(UsersApiService);

  public users = toSignal(this._userService.usersControllerAllUsersV1(), {
    initialValue: [],
  });
}
