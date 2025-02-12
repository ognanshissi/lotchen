import { Component } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';

@Component({
  selector: 'settings-roles',
  templateUrl: './roles.component.html',
  standalone: true,
  imports: [ButtonModule, TasIcon, TasText, TasTitle],
})
export class RolesComponent {}

export default RolesComponent;
