import { Component, inject } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasInput } from '@talisoft/ui/input';
import { UsersApiService } from '@talisoft/api/lotchen-client-api';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TasSelect } from '@talisoft/ui/select';

@Component({
  selector: 'settings-add-territory-dialog',
  templateUrl: './add-territory-dialog.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    FormField,
    TasClosableDrawer,
    TasDrawerAction,
    TasIcon,
    TasSideDrawer,
    TasTitle,
    TasText,
    TasDrawerTitle,
    TasDrawerContent,
    TasLabel,
    TasInput,
    FormsModule,
    TasSelect,
  ],
})
export class AddTerritoryDialogComponent {
  private readonly _userService = inject(UsersApiService);

  public users = toSignal(
    this._userService.usersControllerAllUsersV1().pipe(map((res) => res)),
    { initialValue: [] }
  );
}
