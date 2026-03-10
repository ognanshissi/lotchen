import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import {
  MeetingsApiService,
  EventTypesApiService,
  FindMeetingsByRangeResponse,
  FindAllEventTypesQueryResponse,
} from '@talisoft/api/lotchen-client-api';
import { AddMeetingDialogService } from '@lotchen/lotchen/common/components';
import {
  CalendarHeaderComponent,
  CalendarViewMode,
} from '../../components/calendar-header/calendar-header.component';
import { CalendarMonthViewComponent } from '../../components/calendar-month-view/calendar-month-view.component';
import { CalendarWeekViewComponent } from '../../components/calendar-week-view/calendar-week-view.component';
import {
  EventDetailDialogComponent,
  EventDetailDialogData,
} from '../../components/event-detail-dialog/event-detail-dialog.component';

const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

@Component({
  selector: 'events-calendar',
  standalone: true,
  imports: [
    ButtonModule,
    TasIcon,
    CalendarHeaderComponent,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
  ],
  template: `
    <div class="h-full flex flex-col bg-gray-50">
      <div
        class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200"
      >
        <h1 class="text-2xl font-bold">Événements</h1>
        <button
          tas-raised-button
          color="primary"
          (click)="openAddMeetingDialog()"
        >
          <tas-icon iconName="feather:plus"></tas-icon>
          Nouvel événement
        </button>
      </div>

      <events-calendar-header
        [viewMode]="viewMode()"
        [periodLabel]="periodLabel()"
        (viewModeChange)="setViewMode($event)"
        (prev)="navigatePrev()"
        (next)="navigateNext()"
        (today)="navigateToday()"
      />

      @if (viewMode() === 'month') {
      <events-calendar-month-view
        [events]="events()"
        [currentDate]="currentDate()"
        [eventTypeColors]="eventTypeColors()"
        (eventClick)="onEventClick($event)"
        (slotClick)="onSlotClick($event)"
      />
      } @else {
      <events-calendar-week-view
        [events]="events()"
        [currentDate]="currentDate()"
        [eventTypeColors]="eventTypeColors()"
        (eventClick)="onEventClick($event)"
        (slotClick)="onSlotClick($event)"
      />
      }
    </div>
  `,
})
export class EventsCalendarComponent implements OnInit {
  private readonly _meetingsApi = inject(MeetingsApiService);
  private readonly _eventTypesApi = inject(EventTypesApiService);
  private readonly _meetingDialog = inject(AddMeetingDialogService);
  private readonly _dialog = inject(Dialog);

  public viewMode = signal<CalendarViewMode>('month');
  public currentDate = signal<Date>(new Date());
  public events = signal<FindMeetingsByRangeResponse[]>([]);
  public eventTypes = signal<FindAllEventTypesQueryResponse[]>([]);

  public eventTypeColors = computed(() => {
    const map: Record<string, string> = {};
    for (const et of this.eventTypes()) {
      map[et.id] = et.color;
    }
    return map;
  });

  public periodLabel = computed(() => {
    const date = this.currentDate();
    if (this.viewMode() === 'month') {
      return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    }
    // Week view: show range
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${monday.getDate()} - ${sunday.getDate()} ${
      MONTH_NAMES[sunday.getMonth()]
    } ${sunday.getFullYear()}`;
  });

  public ngOnInit(): void {
    this._eventTypesApi.eventTypesControllerFindAllEventTypesV1().subscribe({
      next: (types) => this.eventTypes.set(types),
    });
    this.loadEvents();
  }

  public setViewMode(mode: CalendarViewMode): void {
    this.viewMode.set(mode);
    this.loadEvents();
  }

  public navigatePrev(): void {
    const date = new Date(this.currentDate());
    if (this.viewMode() === 'month') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setDate(date.getDate() - 7);
    }
    this.currentDate.set(date);
    this.loadEvents();
  }

  public navigateNext(): void {
    const date = new Date(this.currentDate());
    if (this.viewMode() === 'month') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setDate(date.getDate() + 7);
    }
    this.currentDate.set(date);
    this.loadEvents();
  }

  public navigateToday(): void {
    this.currentDate.set(new Date());
    this.loadEvents();
  }

  public onEventClick(event: FindMeetingsByRangeResponse): void {
    const ref = this._dialog.open(EventDetailDialogComponent, {
      width: '600px',
      data: {
        event,
        eventTypes: this.eventTypes(),
      } as EventDetailDialogData,
    });

    ref.closed.subscribe((result: any) => {
      if (result === true) {
        this.loadEvents();
      } else if (result?.action === 'follow-up') {
        this.openAddMeetingDialog();
      }
    });
  }

  public onSlotClick(date: Date): void {
    const dateStr = date.toISOString().split('T')[0];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    this._meetingDialog.open({
      relatedId: '',
      relatedType: 'Meeting',
      prefillDate: dateStr,
      prefillTime: `${hours}:${minutes}`,
    });
  }

  public openAddMeetingDialog(): void {
    this._meetingDialog.open({
      relatedId: '',
      relatedType: 'Meeting',
    });
  }

  private loadEvents(): void {
    const { start, end } = this.getDateRange();
    this._meetingsApi.meetingsControllerFindByRangeV1(start, end).subscribe({
      next: (events) => this.events.set(events),
    });
  }

  private getDateRange(): { start: string; end: string } {
    const date = this.currentDate();
    if (this.viewMode() === 'month') {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      start.setDate(start.getDate() - 7); // Buffer for previous month days shown
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      end.setDate(end.getDate() + 7); // Buffer for next month days shown
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    } else {
      const day = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((day + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0],
      };
    }
  }
}

export default EventsCalendarComponent;
