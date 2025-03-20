import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  CallerApiService,
  ContactsApiService,
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
  private readonly _contactApiService = inject(ContactsApiService);

  // Inputs
  public entityId: string = this._dialogData['id'];
  public clientName: string = this._dialogData['clientName'];
  public contactNumber: string = this._dialogData['mobileNumber'];

  public callingStatus = signal<CallingStatusEnum>(CallingStatusEnum.Call);

  public callingStatusEnum = CallingStatusEnum;

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

  public ngOnInit(): void {
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
    this._callerApiService.callerControllerTokenV1().subscribe({
      next: (response) => {
        // this.token = response.token;
        this.intitializeDevice(response.token);
      },
      error: (err) => {
        this.isGettingDeviceReadyLoading.set(false);
        console.log(err);
      },
    });
  }

  private intitializeDevice(token: string) {
    this.device = new Device(token, {
      logLevel: 4, // 1 for developpment
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
      //   callControlsDiv.classList.remove('hide');
    });

    device.on('error', (error) => {
      this.twilioDeviceReady.set(false);
      this.isGettingDeviceReadyLoading.set(false);
      console.log('Twilio.Device Error: ' + error.message);
    });

    device.on('incoming', this.handleIncomingCall);

    this.device?.audio?.on('deviceChange', this.updateAllAudioDevices);

    // Show audio selection UI if it is supported by the browser.
    if (this.device?.audio?.isOutputSelectionSupported) {
      //   audioSelectionDiv.classList.remove('hide');
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

  private handleIncomingCall() {
    console.log('Handle Incomming Call');
  }

  public async makeOutgoingCall() {
    const params = {
      // get the phone number to call from the DOM
      To: '+2250777132974',
    };

    if (this.device) {
      console.log(`Attempting to call ${params.To} ...`);
      this.callingStatus.set(CallingStatusEnum.Calling);

      // Twilio.Device.connect() returns a Call object
      this.call = await this.device.connect({ params });

      // add listeners to the Call
      // "accepted" means the call has finished connecting and the state is now "open"
      this.call.on('accept', () => {
        this.callingStatus.set(CallingStatusEnum.Online);
        this.startDate = new Date();
        this.timerInterval = setInterval(() => {
          this.timer.set(this.timer() + 1);
        }, 1000);
        // Set call started time
        console.log('Calling in progress...');
        this.call?.on('volume', (inputVolume, outputVolume) => {
          console.log({ inputVolume, outputVolume });
        });
      });
      //   Disconnected event
      this.call.on('disconnect', () => {
        // save to call logs;
        this._contactApiService
          .contactsControllerCreateCallLogV1({
            startDate: this.startDate?.toISOString() ?? '',
            endDate: new Date().toISOString(),
            callSid: this.call?.parameters?.['CallSid'] ?? '',
            duration: this.timer(),
            fromId: '',
            toId: this.entityId,
            entityType: CreateCallLogCommandEntityTypeEnum.Contact,
            toContact: params.To,
            status: 'replied',
          })
          .subscribe({
            next: () => {
              // Wait 2 seconds and close the caller dialog
              setTimeout(() => {
                this.closeCaller();
              }, 2000);
            },
          });

        this.callingStatus.set(CallingStatusEnum.End);
        clearInterval(this.timerInterval);
        this.timer.set(0);
        this.startDate = undefined;
        setTimeout(() => {
          this.callingStatus.set(CallingStatusEnum.Call);
        }, 1000);
      });
      //   Canceled
      this.call.on('cancel', this.updateUIDisconnectedOutgoingCall);
    } else {
      console.log('Unable to make call.');
    }
  }

  public updateUIAcceptedOutgoingCall(call: Call) {}

  public updateUIDisconnectedOutgoingCall() {
    // console.log('Disconnected =>', call);
    // Set call ended time => update contact call logs
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.callingStatus.set(CallingStatusEnum.End);
    setTimeout(() => {
      this.callingStatus.set(CallingStatusEnum.Call);
    }, 2000);
  }

  public outgoingCallHangupButton() {
    console.log('Hanging up ...');
    this.call?.disconnect();
    // this.callingStatus.set(CallingStatusEnum.End);
  }

  /**
   * Close the caller box
   */
  public closeCaller() {
    this._dialogRef.close();
  }
}
