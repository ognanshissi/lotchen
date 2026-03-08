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
  NotesApiService,
  CallLogsApiService,
  MeetingsApiService,
} from '@talisoft/api/lotchen-client-api';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { forkJoin, map, Observable } from 'rxjs';

interface TimelineItem {
  kind: 'note' | 'call' | 'meeting';
  date: Date;
  id: string;
  content?: string;
  title?: string;
  location?: string;
  duration?: number;
  status?: string;
  note?: string;
  agentName?: string;
}

@Component({
  selector: 'prospects-contact-detail-activities',
  templateUrl: './contact-detail-activities.component.html',
  standalone: true,
  imports: [TasCard, TasIcon, DatePipe],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailActivitiesComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _notesApi = inject(NotesApiService);
  private readonly _callLogsApi = inject(CallLogsApiService);
  private readonly _meetingsApi = inject(MeetingsApiService);

  public timeline = signal<TimelineItem[]>([]);
  public loading = signal(true);

  ngOnInit(): void {
    const contactId = this._getContactId();
    if (!contactId) {
      this.loading.set(false);
      return;
    }

    forkJoin({
      notes: this._notesApi.notesControllerFindAllNotesV1(
        '' as any,
        contactId,
        '' as any
      ),
      callLogs:
        this._callLogsApi.callLogsControllerFindAllCallLogsV1(contactId),
      meetings: (this._meetingsApi as any).meetingsControllerFindAllMeetingsV1
        ? (this._meetingsApi as any).meetingsControllerFindAllMeetingsV1(
            contactId
          )
        : new Observable<any[]>((sub) => {
            sub.next([]);
            sub.complete();
          }),
    }).subscribe({
      next: ({ notes, callLogs, meetings }) => {
        const items: TimelineItem[] = [];

        (notes ?? []).forEach((n: any) =>
          items.push({
            kind: 'note',
            date: new Date(n.createdAt),
            id: n.id,
            content: n.content,
          })
        );

        (callLogs ?? []).forEach((c: any) =>
          items.push({
            kind: 'call',
            date: new Date(c.createdAt ?? c.startDate),
            id: c.id,
            duration: c.duration,
            status: c.status,
            note: c.note,
            agentName: c.fromAgentLite
              ? `${c.fromAgentLite.firstName} ${c.fromAgentLite.lastName}`
              : '',
          })
        );

        ((meetings as []) || []).forEach((m: any) =>
          items.push({
            kind: 'meeting',
            date: new Date(m.createdAt),
            id: m.id,
            title: m.title,
            location: m.location,
          })
        );

        items.sort((a, b) => b.date.getTime() - a.date.getTime());
        this.timeline.set(items);
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
    const parentData = this._route?.parent?.data as Observable<Data>;
    let contactId = '';
    parentData
      .pipe(map((data) => data['contact']?.id))
      .subscribe((id) => (contactId = id));
    return contactId;
  }
}
