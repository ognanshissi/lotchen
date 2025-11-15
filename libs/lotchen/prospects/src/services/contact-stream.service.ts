import { inject, Injectable, NgZone } from '@angular/core';
import {
  AuthenticationService,
  ENVIRONMENT_CONFIG,
} from '@lotchen/lotchen/common';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactStreamService {
  private readonly _environment = inject(ENVIRONMENT_CONFIG);
  private readonly _authService = inject(AuthenticationService);

  public constructor(private readonly _zone: NgZone) {}

  public getContactStream(): Observable<string> {
    const ctr = new AbortController();
    return new Observable((oberver) => {
      fetchEventSource(
        `${this._environment.apiUrl}/api/v1/contacts/contacts-stream`,
        {
          signal: ctr.signal,
          headers: {
            Authorization: `Bearer ${this._authService.accessToken()}`,
            'X-TENANT-FQDN': 'db',
          },

          onmessage: (event) => {
            console.log('Received event:', event);
            console.log('Parsed event data:', event.data);
            this._zone.run(() => {
              oberver.next(event.data as string);
            });
          },

          onerror: (error) => {
            this._zone.run(() => {
              console.error('EventSource error:', error);
              // Handle the error as needed
              oberver.error(error);
            });
          },
        }
      ).then();
    });

    // return new Observable((observer) => {
    //   const url = new URL(
    //     `${this._environment.apiUrl}/api/v1/contacts/contacts-stream`
    //   );
    //   const eventSource = new EventSource(url, { withCredentials: true });

    //   eventSource.onmessage = (event) => {
    //     console.log('Received event:', event);
    //     this._zone.run(() => {
    //       observer.next(JSON.parse(event.data));
    //     });
    //   };

    //   eventSource.onerror = (error) => {
    //     this._zone.run(() => {
    //       observer.error(error);
    //     });
    //   };

    //   return () => {
    //     eventSource.close();
    //   };
    // });
  }
}
