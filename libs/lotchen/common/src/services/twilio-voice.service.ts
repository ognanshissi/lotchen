import { inject, Injectable } from '@angular/core';
import { CallerApiService } from '@talisoft/api/lotchen-client-api';
import { Call, Device } from '@twilio/voice-sdk';

@Injectable({
  providedIn: 'root',
})
export class TwilioVoiceService {
  private readonly _callerApiService = inject(CallerApiService);
  private device!: Device;

  async initDevices() {
    this._callerApiService.callerControllerTokenV1().subscribe({
      next: (response) => {
        console.log({ response });

        this.device = new Device(response.token, {
          logLevel: 1,
          codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
        });

        this.device.on('ready', () => console.log('Twilio Device Ready'));
        this.device.on('error', (error) =>
          console.error('Twilio Error:', error)
        );
        this.device.on('incoming', (call) => {
          console.log('Incoming Call:', call);
          call.accept();
        });

        this.device.register();
      },
    });
  }
}
