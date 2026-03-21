import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { TasSelect } from '@talisoft/ui/select';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { MessageTemplatesApiService } from '@talisoft/api/lotchen-client-api';
import { finalize } from 'rxjs';

@Component({
  selector: 'campaigns-template-form',
  standalone: true,
  templateUrl: './template-form.component.html',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TasTitle,
    TasText,
    TasCard,
    TasCardHeader,
    TasIcon,
    ButtonModule,
    FormField,
    TasLabel,
    TasInput,
    TasSelect,
  ],
})
export class TemplateFormComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _templatesApi = inject(MessageTemplatesApiService);
  private readonly _snackbar = inject(SnackbarService);

  public isEditMode = signal(false);
  public templateId = signal<string | null>(null);
  public isLoading = signal(false);

  public form!: FormGroup;

  public channelOptions = [
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' },
    { label: 'WhatsApp', value: 'whatsapp' },
  ];

  public mergeFields = [
    '{{firstName}}',
    '{{lastName}}',
    '{{company}}',
    '{{email}}',
    '{{phone}}',
  ];

  public sampleData: Record<string, string> = {
    '{{firstName}}': 'Jean',
    '{{lastName}}': 'Dupont',
    '{{company}}': 'Acme Corp',
    '{{email}}': 'jean.dupont@example.com',
    '{{phone}}': '+33 6 12 34 56 78',
  };

  public ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      channel: new FormControl('email', [Validators.required]),
      subject: new FormControl(null),
      body: new FormControl(null, [Validators.required]),
      category: new FormControl(null),
      mergeFields: new FormControl([]),
      isWhatsAppApproved: new FormControl(false),
      whatsAppTemplateId: new FormControl(null),
    });

    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.templateId.set(id);
      this.loadTemplate(id);
    }
  }

  public insertMergeField(field: string): void {
    const bodyControl = this.form.get('body');
    const currentValue = bodyControl?.value || '';
    bodyControl?.setValue(currentValue + field);

    const currentFields = this.form.get('mergeFields')?.value || [];
    const fieldName = field.replace(/\{\{|\}\}/g, '');
    if (!currentFields.includes(fieldName)) {
      this.form.get('mergeFields')?.setValue([...currentFields, fieldName]);
    }
  }

  public getPreview(): string {
    let body = this.form.get('body')?.value || '';
    for (const [key, value] of Object.entries(this.sampleData)) {
      body = body.replaceAll(key, value);
    }
    return body;
  }

  public getSmsSegmentCount(): number {
    const body = this.form.get('body')?.value || '';
    return Math.ceil(body.length / 160) || 0;
  }

  public submit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const value = this.form.getRawValue();

    const payload: any = {
      name: value.name,
      channel: value.channel,
      body: value.body,
      category: value.category || undefined,
      mergeFields: value.mergeFields || [],
    };

    if (value.channel === 'email') {
      payload.subject = value.subject;
    }
    if (value.channel === 'whatsapp') {
      payload.isWhatsAppApproved = value.isWhatsAppApproved;
      payload.whatsAppTemplateId = value.whatsAppTemplateId || undefined;
    }

    const obs$ = this.isEditMode()
      ? this._templatesApi.messageTemplatesControllerUpdateV1(
          this.templateId()!,
          payload
        )
      : this._templatesApi.messageTemplatesControllerCreateV1(payload);

    obs$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this._snackbar.success(
          'Succès',
          this.isEditMode() ? 'Template mis à jour' : 'Template créé'
        );
        this._router.navigate(['/portal/campaigns/templates']);
      },
      error: () =>
        this._snackbar.error(
          'Erreur',
          this.isEditMode()
            ? 'Impossible de mettre à jour le template'
            : 'Impossible de créer le template'
        ),
    });
  }

  private loadTemplate(id: string): void {
    this._templatesApi.messageTemplatesControllerFindByIdV1(id).subscribe({
      next: (template) => {
        this.form.patchValue({
          name: template.name,
          channel: template.channel,
          subject: template.subject,
          body: template.body,
          category: template.category,
          mergeFields: template.mergeFields || [],
          isWhatsAppApproved: template.isWhatsAppApproved || false,
          whatsAppTemplateId: template.whatsAppTemplateId,
        });
      },
    });
  }
}

export default TemplateFormComponent;
