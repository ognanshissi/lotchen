import { Component } from '@angular/core';
import { FormField } from '@talisoft/ui/form-field';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';

@Component({
  selector: 'tas-navigation',
  templateUrl: './navigation.html',
  standalone: true,
  imports: [FormField, ButtonModule, TasIcon],
})
export class TasNavigation {}
