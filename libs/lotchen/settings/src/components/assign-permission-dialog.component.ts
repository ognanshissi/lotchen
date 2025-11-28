import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { PermissionsApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';

import { DialogRef } from '@angular/cdk/dialog';
import { TasMultiSelect } from '@talisoft/ui/multi-select';
import { apiResources } from '@talisoft/ui/api-resources';

@Component({
  selector: 'settings-assign-permission-dialog',
  standalone: true,
  imports: [
    CommonModule,
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
    TasMultiSelect,
  ],
  templateUrl: './assign-permission-dialog.component.html',
  styleUrl: './assign-permission-dialog.component.scss',
})
export class AssignPermissionDialogComponent {
  private readonly _permissionsApiService = inject(PermissionsApiService);
  private readonly _snackbarService = inject(SnackbarService);
  private readonly _dialogRef = inject(DialogRef);

  public form: FormGroup;
  public errorMessage: string | null = null;
  public isLoading = false;

  public permissions = apiResources(
    this._permissionsApiService.permissionsControllerAllPermissionsV1()
  );

  public constructor() {
    this.form = new FormGroup({
      permissions: new FormControl([], [Validators.required]),
    });
  }

  public submit(): void {
    this.errorMessage = null;
    if (this.form.invalid) {
      this.errorMessage = 'Veuillez sélectionner au moins une permission.';
      return;
    }

    const { permissions } = this.form.getRawValue();
    this._dialogRef.close(permissions);
  }
}
