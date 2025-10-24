import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  TasSideDrawer,
  TasDrawerTitle,
  TasDrawerContent,
  TasDrawerAction,
} from '@talisoft/ui/side-drawer';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasAlert } from '@talisoft/ui/alert';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { TasInput } from '@talisoft/ui/input';
import {
  CreateRoleCommandResponse,
  RolesApiService,
} from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { finalize } from 'rxjs';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'settings-add-role-dialog',
  templateUrl: './add-role-dialog.component.html',
  standalone: true,
  imports: [
    TasSideDrawer,
    TasDrawerTitle,
    TasTitle,
    TasDrawerContent,
    TasText,
    TasAlert,
    FormField,
    TasLabel,
    TasDrawerAction,
    TasIcon,
    ButtonModule,
    ReactiveFormsModule,
    TasInput,
  ],
})
export class AddRoleDialogComponent {
  private readonly _rolesApiService = inject(RolesApiService);
  private readonly _snackbarService = inject(SnackbarService);
  private readonly _dialogRef = inject(DialogRef);

  public form: FormGroup;

  public errorMessage: string | null = null;

  public isLoading = false;

  public constructor() {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
    });
  }

  public submit(): void {
    this.errorMessage = null;
    if (this.form.invalid) {
      this.errorMessage = 'Please fill all required fields.';
      this._snackbarService.error(
        'Attention !',
        `Veuillez remplir tous les champs obligatoires.`
      );
      return;
    }

    const { name } = this.form.getRawValue();

    this.isLoading = true;
    this._rolesApiService
      .rolesControllerCreateRoleV1({
        name,
        permissions: [],
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (role: CreateRoleCommandResponse) => {
          console.log(role);
          this._snackbarService.success(
            'Succès !',
            `Le rôle ${name} a été créé avec succès.`
          );
          this._dialogRef.close(role);
        },
        error: (err) => {
          this.errorMessage = err.message || 'An error occurred.';
          this._snackbarService.error(
            'Erreur !',
            `Une erreur est survenue lors de la création du rôle.`
          );
        },
      });
  }
}
