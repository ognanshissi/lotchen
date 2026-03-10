import { Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { FindMeetingsByRangeResponse } from '@talisoft/api/lotchen-client-api';

@Component({
  selector: 'events-calendar-week-view',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="bg-white overflow-auto" style="max-height: calc(100vh - 200px)">
      <!-- Header row with day names -->
      <div
        class="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10"
      >
        <div
          class="py-2 px-2 text-center text-xs text-gray-400 border-r border-gray-100"
        ></div>
        @for (day of weekDays(); track day.toISOString()) {
        <div
          class="py-2 px-2 text-center border-r border-gray-100"
          [ngClass]="{ 'bg-blue-50/30': isToday(day) }"
        >
          <div class="text-xs text-gray-500">{{ getDayName(day) }}</div>
          <div
            class="text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-full mx-auto"
            [ngClass]="{
              'bg-primary text-white': isToday(day),
              'text-gray-700': !isToday(day)
            }"
          >
            {{ day.getDate() }}
          </div>
        </div>
        }
      </div>

      <!-- Time grid -->
      @for (hour of hours; track hour) {
      <div class="grid grid-cols-8 border-b border-gray-50">
        <div
          class="py-3 px-2 text-right text-xs text-gray-400 border-r border-gray-100"
        >
          {{ hour }}:00
        </div>
        @for (day of weekDays(); track day.toISOString()) {
        <div
          class="relative min-h-[60px] border-r border-gray-100 cursor-pointer hover:bg-gray-50"
          [ngClass]="{ 'bg-blue-50/10': isToday(day) }"
          (click)="onSlotClick(day, hour)"
        >
          @for (event of getEventsForSlot(day, hour); track event.id) {
          <div
            class="absolute left-0.5 right-0.5 px-1.5 py-0.5 rounded text-xs text-white overflow-hidden cursor-pointer z-10"
            [style.backgroundColor]="getEventColor(event)"
            [style.top.px]="getEventTopOffset(event)"
            [style.height.px]="getEventHeight(event)"
            (click)="onEventClick($event, event)"
          >
            <div class="font-medium truncate">{{ event.title }}</div>
            <div class="opacity-80">
              {{ $any(event.startAt).time }} - {{ $any(event.endAt).time }}
            </div>
          </div>
          }
        </div>
        }
      </div>
      }
    </div>
  `,
})
export class CalendarWeekViewComponent {
  events = input.required<FindMeetingsByRangeResponse[]>();
  currentDate = input.required<Date>();
  eventTypeColors = input<Record<string, string>>({});
  eventClick = output<FindMeetingsByRangeResponse>();
  slotClick = output<Date>();

  readonly hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7am to 9pm

  private readonly dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  weekDays = computed<Date[]>(() => {
    const date = this.currentDate();
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  });

  getDayName(date: Date): string {
    return this.dayNames[date.getDay()];
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  getEventsForSlot(day: Date, hour: number): FindMeetingsByRangeResponse[] {
    return this.events().filter((event) => {
      const eventDate = new Date((event.startAt as any).date);
      eventDate.setHours(0, 0, 0, 0);
      if (eventDate.getTime() !== day.getTime()) return false;
      const eventHour = parseInt((event.startAt as any).time.split(':')[0], 10);
      return eventHour === hour;
    });
  }

  getEventTopOffset(event: FindMeetingsByRangeResponse): number {
    const minutes = parseInt(
      (event.startAt as any)?.time.split(':')[1] || '0',
      10
    );
    return (minutes / 60) * 60;
  }

  getEventHeight(event: FindMeetingsByRangeResponse): number {
    const startParts = (event.startAt as any).time.split(':');
    const endParts = (event.endAt as any).time.split(':');
    const startMinutes =
      parseInt(startParts[0], 10) * 60 + parseInt(startParts[1] || '0', 10);
    const endMinutes =
      parseInt(endParts[0], 10) * 60 + parseInt(endParts[1] || '0', 10);
    const durationMinutes = Math.max(endMinutes - startMinutes, 15);
    return (durationMinutes / 60) * 60;
  }

  getEventColor(event: FindMeetingsByRangeResponse): string {
    const colors = this.eventTypeColors();
    return colors[event.eventTypeId] ?? '#6366f1';
  }

  onSlotClick(day: Date, hour: number): void {
    const date = new Date(day);
    date.setHours(hour, 0, 0, 0);
    this.slotClick.emit(date);
  }

  onEventClick(e: Event, event: FindMeetingsByRangeResponse): void {
    e.stopPropagation();
    this.eventClick.emit(event);
  }
}
