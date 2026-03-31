import { Component, inject, OnInit, ViewChild } from '@angular/core';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasText } from '@talisoft/ui/text';
import { TasInput } from '@talisoft/ui/input';
import { TasIcon } from '@talisoft/ui/icon';
import { TasSelect } from '@talisoft/ui/select';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { finalize } from 'rxjs';
import { DialogRef } from '@angular/cdk/dialog';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { LeadsApiService } from '@talisoft/api/lotchen-client-api';
import { DynamicFieldsComponent } from '@lotchen/lotchen/common/components';

@Component({
  selector: 'leads-quick-add',
  templateUrl: './quick-add-lead.component.html',
  imports: [
    TasSideDrawer,
    TasTitle,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    ButtonModule,
    TasClosableDrawer,
    FormField,
    TasLabel,
    TasText,
    TasInput,
    TasIcon,
    TasSelect,
    ReactiveFormsModule,
    TasCard,
    TasCardHeader,
    DynamicFieldsComponent,
  ],
  standalone: true,
})
export class QuickAddLeadComponent implements OnInit {
  @ViewChild(DynamicFieldsComponent)
  dynamicFields?: DynamicFieldsComponent;

  private readonly _snackbarService = inject(SnackbarService);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _leadsApiService = inject(LeadsApiService);

  public sourceOptions = [
    { label: 'Back Office', value: 'Back Office' },
    { label: 'Website', value: 'Website' },
    { label: 'Referral', value: 'Referral' },
    { label: 'Social Media', value: 'Social Media' },
    { label: 'LinkedIn', value: 'LinkedIn' },
    { label: 'Facebook', value: 'Facebook' },
    { label: 'Event', value: 'Event' },
    { label: 'Cold Call', value: 'Cold Call' },
    { label: 'Campaign', value: 'Campaign' },
    { label: 'Other', value: 'Other' },
  ];

  public priorityOptions = [
    { label: 'Basse', value: 'Low' },
    { label: 'Moyenne', value: 'Medium' },
    { label: 'Haute', value: 'High' },
    { label: 'Critique', value: 'Critical' },
  ];

  public form!: FormGroup;

  public ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      mobileNumber: new FormControl(null, [Validators.required]),
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
      source: new FormControl('Back Office', [Validators.required]),
      productInterest: new FormControl(null),
      estimatedValue: new FormControl(null),
      priority: new FormControl(null),
      notes: new FormControl(null),
      tags: new FormControl(null),
    });
  }

  public submit() {
    this.form.disable();
    const formValue = this.form.getRawValue();

    const payload: any = {
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      mobileNumber: formValue.mobileNumber,
      source: formValue.source,
    };

    if (formValue.productInterest)
      payload.productInterest = formValue.productInterest;
    if (formValue.estimatedValue)
      payload.estimatedValue = Number(formValue.estimatedValue);
    if (formValue.priority) payload.priority = formValue.priority;
    if (formValue.notes) payload.notes = formValue.notes;

    if (formValue.tags) {
      payload.tags = formValue.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    const customFieldValues = this.dynamicFields?.getValues();
    if (customFieldValues && Object.keys(customFieldValues).length > 0) {
      payload.customFields = customFieldValues;
    }

    this._leadsApiService
      .leadsControllerCreateLeadV1(payload)
      .pipe(finalize(() => this.form.enable()))
      .subscribe({
        next: () => {
          this._snackbarService.success(
            'Félicitations!',
            'Le lead a été ajouté avec succès.'
          );
          this._dialogRef.close();
        },
        error: () => {
          this._snackbarService.error(
            'Attention!',
            "Une erreur est survenue, impossible d'ajouter le lead."
          );
        },
      });
  }
}
