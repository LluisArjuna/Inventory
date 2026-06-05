import { Injectable } from '@angular/core';
import { Calendar, type CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly defaultOptions: Partial<CalendarOptions> = {
    plugins: [dayGridPlugin, interactionPlugin],
    locale: 'en',
    height: 'auto',
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
  };

  createCalendar(elementId: string, options: Partial<CalendarOptions> = {}): Calendar | null {
    const el = document.getElementById(elementId);
    if (!el) return null;

    el.classList.add('calendar-dark');

    const calendar = new Calendar(el, {
      ...this.defaultOptions,
      ...options,
    });

    calendar.render();
    return calendar;
  }

  destroyCalendar(calendar: Calendar | null): void {
    calendar?.destroy();
  }
}
