import { Component } from '@angular/core';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';
import { TasCard, TasCardAction } from '@talisoft/ui/card';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { TasSelect } from '@talisoft/ui/select';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'settings-user-add',
  templateUrl: './user-add.component.html',
  standalone: true,
  imports: [
    TasText,
    TasTitle,
    TasCard,
    ButtonModule,
    TasIcon,
    FormField,
    TasInput,
    TasLabel,
    TasSelect,
    TasCardAction,
    RouterLink,
  ],
})
export class UserAddComponent {}

export default UserAddComponent;
