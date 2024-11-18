import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from '../../../../libs/shared/ui/button';
import { FormControl, Validators } from '@angular/forms';

@Component({
  standalone: true,
  imports: [RouterModule, ButtonModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Lotchen';

  public password = new FormControl(null, [
    Validators.required,
    Validators.minLength(6),
  ]);
}
