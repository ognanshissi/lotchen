import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from '@talisoft/ui/button';
import { FormControl, Validators } from '@angular/forms';
import { TasInputPassword } from '@talisoft/ui/input-password';
import { TasTitle } from '@talisoft/ui/title';

@Component({
  standalone: true,
  imports: [RouterModule, ButtonModule, TasInputPassword, TasTitle],
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
