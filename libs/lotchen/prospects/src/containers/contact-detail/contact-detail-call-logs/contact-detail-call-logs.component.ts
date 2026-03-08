import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { DatePipe } from '@angular/common';
import {
  CallLogsApiService,
  FindAllCallLogsQueryResponse,
} from '@talisoft/api/lotchen-client-api';
import { TasCard } from '@talisoft/ui/card';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'prospects-contact-detail-call-logs',
  templateUrl: './contact-detail-call-logs.component.html',
  standalone: true,
  imports: [TasCard, DatePipe],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailCallLogsComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _callLogsApi = inject(CallLogsApiService);

  public callLogs = signal<
    (FindAllCallLogsQueryResponse & Record<string, any>)[]
  >([]);
  public loading = signal(true);

  ngOnInit(): void {
    const contactId = this._getContactId();
    if (!contactId) {
      this.loading.set(false);
      return;
    }

    this._callLogsApi.callLogsControllerFindAllCallLogsV1(contactId).subscribe({
      next: (logs) => {
        this.callLogs.set(logs ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  public formatDuration(seconds?: number): string {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  private _getContactId(): string {
    let contactId = '';
    (this._route?.parent?.data as Observable<Data>)
      .pipe(map((data) => data['contact']?.id))
      .subscribe((id) => (contactId = id));
    return contactId;
  }
}
