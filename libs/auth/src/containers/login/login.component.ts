import { Component, inject, OnInit } from '@angular/core';
import { TasInputPassword } from '@talisoft/ui/input-password';
import { TasSpinner } from '@talisoft/ui/spinner';
import { ButtonModule } from '@talisoft/ui/button';
import { TasTitle } from '@talisoft/ui/title';
import { FormField, TasLabel, TasPrefix } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TasCheckbox } from '@talisoft/ui/checkbox';
import { TasContainer } from '@talisoft/ui/container';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TasIcon } from '@talisoft/ui/icon';
import { TasAlert } from '@talisoft/ui/alert';
import { TasText } from '@talisoft/ui/text';
import { TasInputEmail } from '@talisoft/ui/input-email';
import { AuthenticationService } from '@talisoft/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'auth-login',
  templateUrl: 'login.component.html',
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
    TasContainer,
    TasPrefix,
    TasIcon,
    TasAlert,
    RouterLink,
    TasText,
    TasInputEmail,
  ],
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _authenticationService = inject(AuthenticationService);
  public errorMessage = this._authenticationService.errorMessage;

  /**
   * OnInit
   */
  public ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
      ]),
      rememberMe: new FormControl(true),
    });
  }

  public submit(): void {
    const { email, password } = this.loginForm.getRawValue();
    this.loginForm.disable();

    this._authenticationService
      .login({
        email,
        password,
      })
      .pipe(
        finalize(() => {
          this.loginForm.enable();
        })
      )
      .subscribe({
        next: () => {
          const redirectPath =
            this._activatedRoute.snapshot.queryParamMap.get('redirectPath') ??
            '/portal/dashboard';
          this._router.navigate([redirectPath]);
        },
        error: () => {
          this.loginForm.get('password')?.setValue('');
        },
      });
  }
}


export default LoginComponent;
