import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CallerApiService,
  CallLogsApiService,
  CreateCallLogCommandEntityTypeEnum,
} from '@talisoft/api/lotchen-client-api';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasSpinner } from '@talisoft/ui/spinner';
import { Call, Device } from '@twilio/voice-sdk';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export enum CallingStatusEnum {
  Waiting = 'Chargement...',
  Call = 'Appeler',
  Calling = 'Appel en cours...',
  Online = 'En ligne',
  End = 'Appel terminé',
  IncomingCall = 'Appel entrant',
}

@Component({
  selector: 'common-caller',
  templateUrl: './caller.component.html',
  standalone: true,
  imports: [TasIcon, ButtonModule, NgClass, TasSpinner, ReactiveFormsModule],
})
export class CallerComponent implements OnInit {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _callerApiService = inject(CallerApiService);
  private readonly _dialogData = inject(DIALOG_DATA);
  private readonly _callLogApiService = inject(CallLogsApiService);

  // Inputs
  public entityId: string = this._dialogData['id'];
  public clientName: string = this._dialogData['clientName'];
  public contactNumber: string = this._dialogData['mobileNumber'];
  public mode: 'inbound' | 'outbound' = this._dialogData['mode'] ?? 'outbound';

  public callingStatus = signal<CallingStatusEnum>(CallingStatusEnum.Call);
  public callingStatusEnum = CallingStatusEnum;

  public direction = signal<'inbound' | 'outbound'>('outbound');
  public showDisposition = signal(false);

  // Disposition form
  public dispositionForm = new FormGroup({
    note: new FormControl(''),
    disposition: new FormControl(''),
    followUpDate: new FormControl(''),
    followUpAction: new FormControl('none'),
  });

  public dispositionOptions = [
    { value: 'interested', label: 'Intéressé' },
    { value: 'not-interested', label: 'Pas intéressé' },
    { value: 'callback', label: 'Rappel' },
    { value: 'voicemail', label: 'Messagerie vocale' },
    { value: 'wrong-number', label: 'Mauvais numéro' },
    { value: 'no-answer', label: 'Pas de réponse' },
    { value: 'busy', label: 'Occupé' },
  ];

  public followUpOptions = [
    { value: 'none', label: 'Aucune' },
    { value: 'call-back', label: 'Rappeler' },
    { value: 'send-email', label: 'Envoyer email' },
    { value: 'schedule-meeting', label: 'Planifier réunion' },
  ];

  public isCalling = computed(() => {
    return [CallingStatusEnum.Calling, CallingStatusEnum.Online].includes(
      this.callingStatus()
    );
  });

  public isSettingOpened = signal(false);
  public minimized = signal(false);

  // Call timer
  public timer = signal(0);
  private timerInterval: any;
  public startDate: Date | undefined;
  public callDuration = computed(() => {
    let seconds = this.timer();
    let minutes = seconds / 60;
    let hours = minutes / 60;

    minutes %= 60;
    hours %= 24;
    seconds %= 60;

    return `${Math.floor(hours)}:${Math.floor(minutes)}:${Math.floor(seconds)}`;
  });

  // FormControls
  public outputDeviceFormControl = new FormControl('default');
  public ringtoneDeviceFormControl = new FormControl('default');

  public isGettingDeviceReadyLoading = signal(false);
  public device!: Device | undefined;
  private call!: Call | undefined;
  public twilioDeviceReady = signal(false);

  public audioSpeakerList = signal<{ id: string; label: string }[]>([]);

  // Recording & provider info from token
  private recordingEnabled = false;

  // Store final call status for logging
  private finalCallStatus = 'completed';

  public ngOnInit(): void {
    this.direction.set(this.mode);
    this.setup();
    this.getAudioDevices();

    // Handle audio field change
    this.outputDeviceFormControl.valueChanges.subscribe((value) => {
      this.device?.audio?.speakerDevices.set(value ?? '');
    });

    this.ringtoneDeviceFormControl.valueChanges.subscribe((value) => {
      this.device?.audio?.ringtoneDevices.set(value ?? '');
    });
  }

  public toggleSettingOpen() {
    this.isSettingOpened.set(!this.isSettingOpened());
  }

  public toggleMinimize() {
    this.minimized.set(!this.minimized());
  }

  public async getAudioDevices() {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    this.updateAllAudioDevices();
  }

  private setup() {
    console.log('Requesting access token');
    this.isGettingDeviceReadyLoading.set(true);
    this._callerApiService.callerTokenControllerTokenV1().subscribe({
      next: (response: any) => {
        this.recordingEnabled = response.recordingEnabled ?? false;
        this.initializeDevice(response.token);
      },
      error: (err) => {
        this.isGettingDeviceReadyLoading.set(false);
        console.log(err);
      },
    });
  }

  private initializeDevice(token: string) {
    this.device = new Device(token, {
      logLevel: 4,
      codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
    });

    this.device.audio?.speakerDevices.get();

    this.addDeviceListeners(this.device);

    // Device must be registered in order to receive incoming calls
    this.device.register();
  }

  private addDeviceListeners(device: Device) {
    device.on('registered', () => {
      console.log('Twilio.Device Ready to make and receive calls!');
      this.twilioDeviceReady.set(true);
      this.isGettingDeviceReadyLoading.set(false);

      // If opened in inbound mode with a pending incoming call, handle it
      if (this.mode === 'inbound') {
        this.callingStatus.set(CallingStatusEnum.IncomingCall);
      }
    });

    device.on('error', (error) => {
      this.twilioDeviceReady.set(false);
      this.isGettingDeviceReadyLoading.set(false);
      console.log('Twilio.Device Error: ' + error.message);
    });

    device.on('incoming', (incomingCall: Call) => {
      this.handleIncomingCall(incomingCall);
    });

    this.device?.audio?.on(
      'deviceChange',
      this.updateAllAudioDevices.bind(this)
    );

    if (this.device?.audio?.isOutputSelectionSupported) {
      // Audio selection UI available
    }
  }

  private updateAllAudioDevices() {
    if (this.device) {
      this.device?.audio?.speakerDevices.get();
      this.device.audio?.ringtoneDevices.get();
      const audioList: any[] = [];
      this.device.audio?.availableOutputDevices.forEach(
        (device: { label: string }, id: string) => {
          audioList.push({ id, label: device.label });
        }
      );
      this.audioSpeakerList.set(audioList);
    }
  }

  private handleIncomingCall(incomingCall: Call) {
    this.call = incomingCall;
    this.direction.set('inbound');
    this.callingStatus.set(CallingStatusEnum.IncomingCall);

    // Listen for call cancel (caller hung up before answer)
    this.call.on('cancel', () => {
      this.callingStatus.set(CallingStatusEnum.End);
      this.finalCallStatus = 'cancelled';
      this.showDispositionAfterCall();
    });

    this.call.on('disconnect', () => {
      this.finalCallStatus = 'completed';
      clearInterval(this.timerInterval);
      this.callingStatus.set(CallingStatusEnum.End);
      this.showDispositionAfterCall();
    });
  }

  public acceptIncomingCall() {
    if (this.call) {
      this.call.accept();
      this.callingStatus.set(CallingStatusEnum.Online);
      this.startDate = new Date();
      this.timerInterval = setInterval(() => {
        this.timer.set(this.timer() + 1);
      }, 1000);
    }
  }

  public rejectIncomingCall() {
    if (this.call) {
      this.call.reject();
      this.finalCallStatus = 'no-reply';
      this.callingStatus.set(CallingStatusEnum.End);
      this.showDispositionAfterCall();
    }
  }

  public async makeOutgoingCall() {
    const params: Record<string, string> = {
      To: this.contactNumber,
    };

    if (this.recordingEnabled) {
      params['enableRecording'] = 'true';
    }

    if (this.device) {
      console.log(`Attempting to call ${params['To']} ...`);
      this.callingStatus.set(CallingStatusEnum.Calling);
      this.direction.set('outbound');

      this.call = await this.device.connect({ params });

      this.call.on('accept', () => {
        this.callingStatus.set(CallingStatusEnum.Online);
        this.startDate = new Date();
        this.timerInterval = setInterval(() => {
          this.timer.set(this.timer() + 1);
        }, 1000);
        console.log('Calling in progress...');
      });

      this.call.on('disconnect', () => {
        this.finalCallStatus = 'completed';
        this.callingStatus.set(CallingStatusEnum.End);
        clearInterval(this.timerInterval);
        this.showDispositionAfterCall();
      });

      this.call.on('cancel', () => {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
        this.finalCallStatus = 'cancelled';
        this.callingStatus.set(CallingStatusEnum.End);
        this.showDispositionAfterCall();
      });
    } else {
      console.log('Unable to make call.');
    }
  }

  public outgoingCallHangupButton() {
    console.log('Hanging up ...');
    this.call?.disconnect();
  }

  private showDispositionAfterCall() {
    this.showDisposition.set(true);
  }

  public saveDisposition() {
    const formVal = this.dispositionForm.value;
    this._callLogApiService
      .callLogsControllerCreateCallLogV1({
        startDate: this.startDate?.toISOString() ?? new Date().toISOString(),
        endDate: new Date().toISOString(),
        callSid: this.call?.parameters?.['CallSid'] ?? '',
        duration: this.timer(),
        toId: this.entityId,
        entityType: CreateCallLogCommandEntityTypeEnum.Contact,
        toContact: this.contactNumber,
        status: this.finalCallStatus,
        direction: this.direction() as any,
        disposition: formVal.disposition ?? undefined,
        note: formVal.note ?? undefined,
        followUpDate: formVal.followUpDate ? formVal.followUpDate : undefined,
        followUpAction: formVal.followUpAction ?? undefined,
      } as any)
      .subscribe({
        next: () => this.closeCaller(),
        error: () => this.closeCaller(),
      });
  }

  public skipDisposition() {
    this._callLogApiService
      .callLogsControllerCreateCallLogV1({
        startDate: this.startDate?.toISOString() ?? new Date().toISOString(),
        endDate: new Date().toISOString(),
        callSid: this.call?.parameters?.['CallSid'] ?? '',
        duration: this.timer(),
        toId: this.entityId,
        entityType: CreateCallLogCommandEntityTypeEnum.Contact,
        toContact: this.contactNumber,
        status: this.finalCallStatus,
        direction: this.direction() as any,
      } as any)
      .subscribe({
        next: () => this.closeCaller(),
        error: () => this.closeCaller(),
      });
  }

  /**
   * Close the caller box
   */
  public closeCaller() {
    this.timer.set(0);
    this.startDate = undefined;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this._dialogRef.close();
  }
}
