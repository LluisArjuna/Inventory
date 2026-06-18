import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal, afterNextRender, OnDestroy, effect } from '@angular/core';
import { Calendar } from '@fullcalendar/core';
import { CalendarService } from '@shared/services/calendar.service';
import type { AvailabilityDateRange } from '@shared/models';

@Component({
  selector: 'app-lending-calendar',
  template: `<div [id]="calendarId()" class="fc-calendar"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LendingCalendar implements OnDestroy {
  private readonly calendarService = inject(CalendarService);
  private readonly elementRef = inject(ElementRef);

  readonly calendarId = input('lending-calendar', { alias: 'calendarId' });
  readonly editable = input(false);
  readonly availabilities = input<AvailabilityDateRange[]>([]);

  readonly onAvailabilitiesChange = output<AvailabilityDateRange[]>();

  private calendar: Calendar | null = null;

  constructor() {
    afterNextRender(() => {
      this.initCalendar();
    });
  }

  private initCalendar(): void {
    this.calendar = this.calendarService.createCalendar(this.calendarId(), {
      editable: this.editable(),
      selectable: this.editable(),
      selectOverlap: false,
      events: this.toFullCalendarEvents(this.availabilities()),
      select: (info) => {
        if (!this.editable()) return;
        const newRange: AvailabilityDateRange = {
          startDate: info.startStr,
          endDate: info.endStr,
        };
        const updated = [...this.availabilities(), newRange];
        this.onAvailabilitiesChange.emit(updated);
        this.calendar?.addEvent({ title: 'Available', start: info.startStr, end: info.endStr });
      },
      eventClick: (info) => {
        if (!this.editable()) return;
        info.event.remove();
        const updated = this.availabilities().filter(a => {
          const sameStart = a.startDate === info.event.startStr;
          const sameEnd = a.endDate === info.event.endStr;
          return !(sameStart && sameEnd);
        });
        this.onAvailabilitiesChange.emit(updated);
      },
    });
  }

  private toFullCalendarEvents(ranges: AvailabilityDateRange[]): { title: string; start: string; end: string; allDay: boolean }[] {
    return ranges.map(r => ({
      title: 'Available',
      start: r.startDate,
      end: r.endDate,
      allDay: true,
    }));
  }

  ngOnDestroy(): void {
    this.calendarService.destroyCalendar(this.calendar);
  }
}
