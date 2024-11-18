import { Component } from '@angular/core';
import { ButtonModule } from 'libs/shared/ui/button';
import { TasIcon } from 'libs/shared/ui/icon';

@Component({
  selector: 'tas-navigation',
  templateUrl: './navigation.html',
  standalone: true,
  imports: [ButtonModule, TasIcon],
})
export class TasNavigation {}
