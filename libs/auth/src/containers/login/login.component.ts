import { Component, inject, OnInit } from '@angular/core';
import { TasInputPassword } from '../../../../shared/ui/input-password';
import { ButtonModule } from '../../../../shared/ui/button';
import { TasTitle } from '../../../../shared/ui/title';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TasCheckbox } from '../../../../shared/ui/checkbox';
import { TasContainer } from '../../../../shared/ui/container';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TasAlert } from '../../../../shared/ui/alert';
import { TasText } from '../../../../shared/ui/text';
import { TasInputEmail } from '../../../../shared/ui/input-email';
import { AuthenticationService } from '@talisoft/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'auth-login',
  templateUrl: 'login.component.html',
  standalone: true,
  imports: [
    TasInputPassword,
    ButtonModule,
    TasTitle,
    ReactiveFormsModule,
    TasCheckbox,
    TasCheckbox,
    TasContainer,
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
