import { Component, inject, OnInit } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { FormField, TasLabel, TasPrefix } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TasText } from '@talisoft/ui/text';
import { TasInputEmail } from '@talisoft/ui/input-email';

@Component({
  selector: 'auth-forgot-password',
  template: `
    <div class="flex flex-col space-y-4">
      <tas-title> Mot de passe oublié </tas-title>

      <tas-text>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus
        rerum sunt tempore tenetur.
      </tas-text>

      <div class="flex flex-col space-y-8">
        <tas-input-email
          [formControl]="emailControl"
          placeholder="Votre adresse électronique"
          >Adresse électronique</tas-input-email
        >

        <button
          tas-outlined-button
          color="primary"
          [disabled]="!emailControl.valid"
        >
          Reinitiliser mon mot de passe
        </button>
      </div>

      <div class="flex justify-end">
        <button
          tas-text-button
          color="accent"
          [routerLink]="['/auth', 'login']"
        >
          Se connecter
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    TasTitle,
    FormField,
    TasInput,
    TasIcon,
    TasLabel,
    ButtonModule,
    RouterLink,
    ReactiveFormsModule,
    TasPrefix,
    TasText,
    TasInputEmail,
  ],
})
export class ForgotPasswordComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  public emailControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  ngOnInit() {
    const emailParamValue =
      this._activatedRoute.snapshot.queryParamMap.get('email');
    this.emailControl.patchValue(emailParamValue);
  }
}


export default ForgotPasswordComponent;
