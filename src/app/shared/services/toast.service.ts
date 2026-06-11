import { Injectable, signal } from '@angular/core';
import type { Toast } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 0;
  private readonly timeouts = new Map<number, ReturnType<typeof setTimeout>>();

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  remove(id: number): void {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(message: string, type: Toast['type']): void {
    const toast: Toast = { id: ++this.nextId, message, type };
    this.toasts.update(list => [...list, toast]);
    const timer = setTimeout(() => this.remove(toast.id), 5000);
    this.timeouts.set(toast.id, timer);
  }
}
