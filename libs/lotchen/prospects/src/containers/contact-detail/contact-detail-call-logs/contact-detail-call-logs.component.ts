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
import { TasIcon } from '@talisoft/ui/icon';
import { map, Observable } from 'rxjs';
import { CallRecordingPlayerComponent } from '@lotchen/lotchen/common/components';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'prospects-contact-detail-call-logs',
  templateUrl: './contact-detail-call-logs.component.html',
  standalone: true,
  imports: [
    TasCard,
    DatePipe,
    TasIcon,
    CallRecordingPlayerComponent,
    FormsModule,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailCallLogsComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _callLogsApi = inject(CallLogsApiService);
  private readonly _http = inject(HttpClient);

  public callLogs = signal<
    (FindAllCallLogsQueryResponse & Record<string, any>)[]
  >([]);
  public loading = signal(true);
  public editingNoteId = signal<string | null>(null);
  public editingNoteText = signal('');

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

  public startEditNote(
    log: FindAllCallLogsQueryResponse & Record<string, any>
  ) {
    this.editingNoteId.set(log.id);
    this.editingNoteText.set(log.note ?? '');
  }

  public saveNote(logId: string) {
    const note = this.editingNoteText();
    this._http.patch(`/api/v1/call-logs/${logId}`, { note }).subscribe({
      next: () => {
        const logs = this.callLogs().map((l) =>
          l.id === logId ? { ...l, note } : l
        );
        this.callLogs.set(logs);
        this.editingNoteId.set(null);
      },
    });
  }

  public cancelEditNote() {
    this.editingNoteId.set(null);
  }

  public getDispositionLabel(disposition: string): string {
    const map: Record<string, string> = {
      interested: 'Intéressé',
      'not-interested': 'Pas intéressé',
      callback: 'Rappel',
      voicemail: 'Messagerie',
      'wrong-number': 'Mauvais n°',
      'no-answer': 'Pas de réponse',
      busy: 'Occupé',
    };
    return map[disposition] ?? disposition;
  }

  private _getContactId(): string {
    let contactId = '';
    (this._route?.parent?.data as Observable<Data>)
      .pipe(map((data) => data['contact']?.id))
      .subscribe((id) => (contactId = id));
    return contactId;
  }
}
