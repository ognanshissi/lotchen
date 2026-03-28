import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TasCard } from '@talisoft/ui/card';
import { TasTitle } from '@talisoft/ui/title';
import { FormField } from '@talisoft/ui/form-field';
import { TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { TelephonyConfigApiService } from '@talisoft/api/lotchen-client-api';

@Component({
  selector: 'settings-telephony',
  standalone: true,
  templateUrl: './telephony-settings.component.html',
  imports: [
    ReactiveFormsModule,
    TasCard,
    TasTitle,
    FormField,
    TasLabel,
    TasInput,
    ButtonModule,
    TasIcon,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TelephonySettingsComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _telephonyConfigApiService = inject(
    TelephonyConfigApiService
  );

  public loading = signal(true);
  public saving = signal(false);
  public configId = signal<string | null>(null);

  public form = new FormGroup({
    provider: new FormControl('twilio'),
    // Twilio
    twilioAccountSid: new FormControl(''),
    twilioApiKey: new FormControl(''),
    twilioApiSecret: new FormControl(''),
    twilioTwimlAppSid: new FormControl(''),
    twilioCallerId: new FormControl(''),
    // RingOver
    ringoverApiKey: new FormControl(''),
    ringoverTeamId: new FormControl(''),
    ringoverWebhookSecret: new FormControl(''),
    // Asterisk
    asteriskServerHost: new FormControl(''),
    asteriskServerPort: new FormControl('5060'),
    asteriskWsUrl: new FormControl(''),
    asteriskSipDomain: new FormControl(''),
    asteriskStunServer: new FormControl(''),
    asteriskTurnServer: new FormControl(''),
    asteriskTurnUsername: new FormControl(''),
    asteriskTurnPassword: new FormControl(''),
    // Recording
    recordingEnabled: new FormControl(false),
    recordingConsent: new FormControl('disabled'),
  });

  ngOnInit(): void {
    this._telephonyConfigApiService
      .telephonyConfigControllerFindV1()
      .subscribe({
        next: (config) => {
          if (config) {
            this.configId.set(config.id);
            this.form.patchValue({
              provider: config.provider ?? 'twilio',
              twilioAccountSid: config.twilioConfig?.accountSid ?? '',
              twilioApiKey: config.twilioConfig?.apiKey ?? '',
              twilioApiSecret: config.twilioConfig?.apiSecret ?? '',
              twilioTwimlAppSid: config.twilioConfig?.twimlAppSid ?? '',
              twilioCallerId: config.twilioConfig?.callerId ?? '',
              ringoverApiKey: config.ringoverConfig?.apiKey ?? '',
              ringoverTeamId: config.ringoverConfig?.teamId ?? '',
              ringoverWebhookSecret: config.ringoverConfig?.webhookSecret ?? '',
              asteriskServerHost: config.asteriskConfig?.serverHost ?? '',
              asteriskServerPort:
                config.asteriskConfig?.serverPort?.toString() ?? '5060',
              asteriskWsUrl: config.asteriskConfig?.wsUrl ?? '',
              asteriskSipDomain: config.asteriskConfig?.sipDomain ?? '',
              asteriskStunServer: config.asteriskConfig?.stunServer ?? '',
              asteriskTurnServer: config.asteriskConfig?.turnServer ?? '',
              asteriskTurnUsername: config.asteriskConfig?.turnUsername ?? '',
              asteriskTurnPassword: config.asteriskConfig?.turnPassword ?? '',
              recordingEnabled: config.recordingEnabled ?? false,
              recordingConsent: config.recordingConsent ?? 'disabled',
            });
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  public save(): void {
    this.saving.set(true);
    const v = this.form.value;

    const body: any = {
      provider: v.provider,
      recordingEnabled: v.recordingEnabled,
      recordingConsent: v.recordingConsent,
    };

    if (v.provider === 'twilio') {
      body.twilioConfig = {
        accountSid: v.twilioAccountSid,
        apiKey: v.twilioApiKey,
        apiSecret: v.twilioApiSecret,
        twimlAppSid: v.twilioTwimlAppSid,
        callerId: v.twilioCallerId,
      };
    } else if (v.provider === 'ringover') {
      body.ringoverConfig = {
        apiKey: v.ringoverApiKey,
        teamId: v.ringoverTeamId,
        webhookSecret: v.ringoverWebhookSecret,
      };
    } else if (v.provider === 'asterisk') {
      body.asteriskConfig = {
        serverHost: v.asteriskServerHost,
        serverPort: parseInt(v.asteriskServerPort ?? '5060', 10),
        wsUrl: v.asteriskWsUrl,
        sipDomain: v.asteriskSipDomain,
        stunServer: v.asteriskStunServer,
        turnServer: v.asteriskTurnServer,
        turnUsername: v.asteriskTurnUsername,
        turnPassword: v.asteriskTurnPassword,
      };
    }

    this._telephonyConfigApiService
      .telephonyConfigControllerUpsertV1(body)
      .subscribe({
        next: (res) => {
          this.configId.set(res?.id ?? this.configId());
          this.saving.set(false);
          this._snackbar.success(
            'Succès',
            'Configuration téléphonie enregistrée'
          );
        },
        error: () => {
          this.saving.set(false);
          this._snackbar.error('Erreur', "Échec de l'enregistrement");
        },
      });
  }
}

export default TelephonySettingsComponent;
