import { Component, OnInit } from '@angular/core';
import { TasInputPassword } from '@talisoft/ui/input-password';
import { TasSpinner } from '@talisoft/ui/spinner';
import { ButtonModule } from '@talisoft/ui/button';
import { TasTitle } from '@talisoft/ui/title/src/title';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TasCheckbox } from '@talisoft/ui/checkbox';

@Component({
  selector: 'auth-login',
  template: `
    <form [formGroup]="loginForm" class="flex flex-col space-y-5">
      <div>
        <tas-title class="text-center">Connexion</tas-title>
        <p class="text-gray-400 pt-4">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. vero
          voluptas. Cupiditate deserunt dicta dignissimos et ex odio vero!
        </p>
      </div>
      <div class="flex flex-col space-y-5">
        <tas-form-field>
          <tas-label>Adresse électronique</tas-label>
          <input
            type="email"
            formControlName="email"
            tasInput
            placeholder="Adresse électronique"
          />
        </tas-form-field>
        <div>
          <tas-input-password formControlName="password"
            >Mot de passe</tas-input-password
          >
          <p class="flex justify-between items-center">
            <tas-checkbox formControlName="rememberMe">Se souvenir de moi</tas-checkbox>
            <a tas-text-button color="accent" href="#">
              Mot de passe oublié ?</a
            >
          </p>
        </div>
      </div>
      <button tas-raised-button color="primary" size="large" rounded>
        Login
      </button>
    </form>
  `,
  standalone: true,
  imports: [
    TasInputPassword,
    TasSpinner,
    ButtonModule,
    TasTitle,
    FormField,
    TasInput,
    TasLabel,
    ReactiveFormsModule,
    TasCheckbox,
    TasCheckbox,
  ],
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;

  public ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
      ]),
      rememberMe: new FormControl(true)
    });
  }
}


export default LoginComponent;
