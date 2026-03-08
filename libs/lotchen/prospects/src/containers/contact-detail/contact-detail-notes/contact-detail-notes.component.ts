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
  FindAllNotesQueryResponse,
  NotesApiService,
} from '@talisoft/api/lotchen-client-api';
import { TasCard } from '@talisoft/ui/card';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'prospects-contact-detail-notes',
  templateUrl: './contact-detail-notes.component.html',
  standalone: true,
  imports: [TasCard, DatePipe],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailNotesComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _notesApi = inject(NotesApiService);

  public notes = signal<FindAllNotesQueryResponse[]>([]);
  public loading = signal(true);

  ngOnInit(): void {
    const contactId = this._getContactId();
    if (!contactId) {
      this.loading.set(false);
      return;
    }

    this._notesApi
      .notesControllerFindAllNotesV1('' as any, contactId, '' as any)
      .subscribe({
        next: (notes) => {
          this.notes.set(notes ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  private _getContactId(): string {
    let contactId = '';
    (this._route?.parent?.data as Observable<Data>)
      .pipe(map((data) => data['contact']?.id))
      .subscribe((id) => (contactId = id));
    return contactId;
  }
}
