import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  FormArray,
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
import { TasDatePicker } from '@talisoft/ui/date-picker';
import { SnackbarService } from '@talisoft/ui/snackbar';
import {
  CampaignsApiService,
  MessageTemplatesApiService,
} from '@talisoft/api/lotchen-client-api';
import { finalize } from 'rxjs';

@Component({
  selector: 'campaigns-campaign-form',
  standalone: true,
  templateUrl: './campaign-form.component.html',
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
    TasDatePicker,
  ],
})
export class CampaignFormComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _campaignsApi = inject(CampaignsApiService);
  private readonly _templatesApi = inject(MessageTemplatesApiService);
  private readonly _snackbar = inject(SnackbarService);

  public isEditMode = signal(false);
  public campaignId = signal<string | null>(null);
  public isLoading = signal(false);
  public templates = signal<any[]>([]);
  public audienceCount = signal<number | null>(null);
  public isEstimating = signal(false);
  public sendMode = signal<'now' | 'schedule'>('now');

  public form!: FormGroup;

  public channelOptions = [
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' },
    { label: 'WhatsApp', value: 'whatsapp' },
  ];

  public filterFieldOptions = [
    { label: 'Statut', value: 'status' },
    { label: 'Tags', value: 'tags' },
    { label: 'Territoire', value: 'territoryId' },
    { label: 'Source', value: 'source' },
    { label: 'Agent assigné', value: 'assignedToUserId' },
  ];

  public filterOperatorOptions = [
    { label: 'Égal à', value: 'eq' },
    { label: 'Contient', value: 'contains' },
    { label: 'Dans', value: 'in' },
  ];

  public mergeFields = [
    '{{firstName}}',
    '{{lastName}}',
    '{{company}}',
    '{{email}}',
    '{{phone}}',
  ];

  public selectedChannel = computed(() => this.form?.get('channel')?.value);

  public ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      channel: new FormControl('email', [Validators.required]),
      templateId: new FormControl(null),
      subject: new FormControl(null),
      body: new FormControl(null),
      scheduledAt: new FormControl(null),
    });

    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.campaignId.set(id);
      this.loadCampaign(id);
    }

    this.loadTemplates();
  }

  public get audienceFilters(): FormArray {
    if (!this.form.get('audienceFilters')) {
      this.form.addControl('audienceFilters', new FormArray([]));
    }
    return this.form.get('audienceFilters') as FormArray;
  }

  public addFilter(): void {
    this.audienceFilters.push(
      new FormGroup({
        field: new FormControl('status', [Validators.required]),
        operator: new FormControl('eq', [Validators.required]),
        value: new FormControl(null, [Validators.required]),
      })
    );
  }

  public removeFilter(index: number): void {
    this.audienceFilters.removeAt(index);
  }

  public insertMergeField(field: string): void {
    const bodyControl = this.form.get('body');
    const currentValue = bodyControl?.value || '';
    bodyControl?.setValue(currentValue + field);
  }

  public estimateAudience(): void {
    const filters = this.audienceFilters.value;
    this.isEstimating.set(true);
    this._campaignsApi
      .campaignsControllerEstimateAudienceV1({ filters })
      .pipe(finalize(() => this.isEstimating.set(false)))
      .subscribe({
        next: (result) => this.audienceCount.set(result.count),
        error: () =>
          this._snackbar.error('Erreur', "Impossible d'estimer l'audience"),
      });
  }

  public submit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const value = this.form.getRawValue();

    const payload: any = {
      name: value.name,
      channel: value.channel,
      templateId: value.templateId || undefined,
      subject: value.subject || undefined,
      body: value.body || undefined,
      audienceFilters: this.audienceFilters.value,
      scheduledAt:
        this.sendMode() === 'schedule' && value.scheduledAt
          ? value.scheduledAt
          : undefined,
    };

    const obs$ = this.isEditMode()
      ? this._campaignsApi.campaignsControllerUpdateV1(
          this.campaignId()!,
          payload
        )
      : this._campaignsApi.campaignsControllerCreateV1(payload);

    obs$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => {
        this._snackbar.success(
          'Succès',
          this.isEditMode() ? 'Campagne mise à jour' : 'Campagne créée'
        );
        this._router.navigate(['/portal/campaigns']);
      },
      error: () =>
        this._snackbar.error(
          'Erreur',
          this.isEditMode()
            ? 'Impossible de mettre à jour la campagne'
            : 'Impossible de créer la campagne'
        ),
    });
  }

  private loadCampaign(id: string): void {
    this._campaignsApi.campaignsControllerFindByIdV1(id).subscribe({
      next: (campaign) => {
        this.form.patchValue({
          name: campaign.name,
          channel: campaign.channel,
          templateId: campaign.templateId,
          subject: campaign.subject,
          body: campaign.body,
          scheduledAt: campaign.scheduledAt,
        });
        if (campaign.audienceFilters?.length) {
          for (const f of campaign.audienceFilters) {
            this.audienceFilters.push(
              new FormGroup({
                field: new FormControl(f.field),
                operator: new FormControl(f.operator),
                value: new FormControl(f.value),
              })
            );
          }
        }
        if (campaign.scheduledAt) {
          this.sendMode.set('schedule');
        }
      },
    });
  }

  private loadTemplates(): void {
    this._templatesApi.messageTemplatesControllerFindAllV1('').subscribe({
      next: (data) => this.templates.set(data),
    });
  }

  public getFilteredTemplates(): any[] {
    const channel = this.form.get('channel')?.value;
    if (!channel) return this.templates();
    return this.templates().filter((t: any) => t.channel === channel);
  }

  public getTemplateSelectOptions(): { label: string; value: string }[] {
    return this.getFilteredTemplates().map((t: any) => ({
      label: t.name,
      value: t._id,
    }));
  }

  public getSmsSegmentCount(): number {
    const body = this.form.get('body')?.value || '';
    return Math.ceil(body.length / 160) || 0;
  }
}

export default CampaignFormComponent;
