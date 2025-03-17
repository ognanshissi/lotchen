import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CallerApiService } from '@talisoft/api/lotchen-client-api';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { Device, Call } from '@twilio/voice-sdk';

export enum CallingStatusEnum {
  Call = 'Appeler',
  Calling = 'Appel en cours...',
  Online = 'En ligne',
  End = 'Appel terminé',
}

@Component({
  selector: 'common-caller',
  templateUrl: './caller.component.html',
  standalone: true,
  imports: [TasIcon, ButtonModule, NgClass],
})
export class CallerComponent implements OnInit {
  private _callerApiService = inject(CallerApiService);

  public callingStatus = signal<CallingStatusEnum>(CallingStatusEnum.Call);

  public isCalling = computed(() => {
    return this.callingStatus() === CallingStatusEnum.Calling;
  });

  public isSettingOpened = signal(false);

  public minimized = signal(false);

  public token = '';
  public device!: Device | undefined;
  private call!: Call | undefined;
  public twilioDeviceReady = signal(false);

  public audioSpeakerList = signal<{ id: string; label: string }[]>([]);

  public ngOnInit(): void {
    this.setup();
    this.getAudioDevices();
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
    this._callerApiService.callerControllerTokenV1().subscribe({
      next: (response) => {
        this.token = response.token;
        this.intitializeDevice();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  private intitializeDevice() {
    this.device = new Device(this.token, {
      logLevel: 1,
    });

    this.device.audio?.speakerDevices.get();

    this.addDeviceListeners(this.device);

    // Device must be registered in order to receive incoming calls
    this.device.register();
  }

  private addDeviceListeners(device: Device) {
    console.log('AddDeviceListener', device);
    device.on('registered', () => {
      console.log('Twilio.Device Ready to make and receive calls!');
      this.twilioDeviceReady.set(true);
      //   callControlsDiv.classList.remove('hide');
    });

    device.on('error', function (error) {
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
          console.log(device);
          audioList.push({ id, label: device.label });
        }
      );
      this.audioSpeakerList.set(audioList);

      console.log({ audioList });

      //   updateDevices(ringtoneDevices, device.audio.ringtoneDevices.get());
    }
  }

  private handleIncomingCall() {}

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

      console.log({ call: this.call });

      // add listeners to the Call
      // "accepted" means the call has finished connecting and the state is now "open"
      this.call.on('accept', this.updateUIAcceptedOutgoingCall);
      this.call.on('disconnect', this.updateUIDisconnectedOutgoingCall);
      this.call.on('cancel', this.updateUIDisconnectedOutgoingCall);
    } else {
      console.log('Unable to make call.');
    }
  }

  public updateUIAcceptedOutgoingCall() {
    this.callingStatus.set(CallingStatusEnum.Online);
  }

  public updateUIDisconnectedOutgoingCall() {
    this.callingStatus.set(CallingStatusEnum.End);
  }

  public async outgoingCallHangupButton() {
    console.log('Hanging up ...');
    this.call?.disconnect();
    this.callingStatus.set(CallingStatusEnum.End);
  }

  /**
   * Close the caller box
   */
  public closeCaller() {}
}
