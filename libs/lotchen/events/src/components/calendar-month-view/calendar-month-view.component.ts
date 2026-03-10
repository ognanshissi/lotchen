import { Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { FindMeetingsByRangeResponse } from '@talisoft/api/lotchen-client-api';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: FindMeetingsByRangeResponse[];
}

@Component({
  selector: 'events-calendar-month-view',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="bg-white">
      <div class="grid grid-cols-7 border-b border-gray-200">
        @for (day of dayNames; track day) {
        <div class="py-2 px-3 text-center text-sm font-semibold text-gray-600">
          {{ day }}
        </div>
        }
      </div>
      <div class="grid grid-cols-7">
        @for (day of calendarDays(); track day.date.toISOString()) {
        <div
          class="min-h-[120px] border-b border-r border-gray-100 p-1 cursor-pointer hover:bg-gray-50"
          [ngClass]="{
            'bg-gray-50': !day.isCurrentMonth,
            'bg-blue-50/30': day.isToday
          }"
          (click)="slotClick.emit(day.date)"
        >
          <div
            class="text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full"
            [ngClass]="{
              'text-gray-400': !day.isCurrentMonth,
              'bg-primary text-white': day.isToday,
              'text-gray-700': day.isCurrentMonth && !day.isToday
            }"
          >
            {{ day.date.getDate() }}
          </div>
          <div class="space-y-0.5">
            @for (event of day.events.slice(0, 3); track event.id) {
            <div
              class="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer text-white"
              [style.backgroundColor]="getEventColor(event)"
              (click)="onEventClick($event, event)"
            >
              {{ $any(event.startAt).time }} {{ event.title }}
            </div>
            } @if (day.events.length > 3) {
            <div class="text-xs text-gray-500 px-1.5">
              +{{ day.events.length - 3 }} autres
            </div>
            }
          </div>
        </div>
        }
      </div>
    </div>
  `,
})
export class CalendarMonthViewComponent {
  events = input.required<FindMeetingsByRangeResponse[]>();
  currentDate = input.required<Date>();
  eventTypeColors = input<Record<string, string>>({});
  eventClick = output<FindMeetingsByRangeResponse>();
  slotClick = output<Date>();

  readonly dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  calendarDays = computed<CalendarDay[]>(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday = 0, Sunday = 6
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false, isToday: false, events: [] });
    }

    // Current month days
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const date = new Date(year, month, d);
      const isToday = date.getTime() === today.getTime();
      days.push({ date, isCurrentMonth: true, isToday, events: [] });
    }

    // Next month days to fill the grid
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const date = new Date(year, month + 1, d);
        days.push({ date, isCurrentMonth: false, isToday: false, events: [] });
      }
    }

    // Assign events to days
    const allEvents = this.events();
    for (const event of allEvents) {
      const eventDate = new Date((event.startAt as any).date);
      eventDate.setHours(0, 0, 0, 0);
      const day = days.find((d) => d.date.getTime() === eventDate.getTime());
      if (day) {
        day.events.push(event);
      }
    }

    return days;
  });

  getEventColor(event: FindMeetingsByRangeResponse): string {
    const colors = this.eventTypeColors();
    return colors[event.eventTypeId] ?? '#6366f1';
  }

  onEventClick(e: Event, event: FindMeetingsByRangeResponse): void {
    e.stopPropagation();
    this.eventClick.emit(event);
  }
}
