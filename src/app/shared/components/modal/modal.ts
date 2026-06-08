import { ChangeDetectionStrategy, Component, input, output, effect, inject, ElementRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'onKeydown($event)'
  }
})
export class Modal {
  readonly open = input(false);
  readonly title = input('');
  readonly showConfirm = input(false);
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly confirmDisabled = input(false);
  readonly confirmLoading = input(false);
  readonly confirmVariant = input<'primary' | 'danger'>('primary');

  readonly onClose = output<void>();
  readonly onConfirm = output<void>();

  private readonly el = inject(ElementRef);
  private previousFocus: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.previousFocus = document.activeElement as HTMLElement;
        setTimeout(() => this.focusFirstButton(), 0);
      } else if (this.previousFocus) {
        setTimeout(() => this.previousFocus?.focus(), 0);
        this.previousFocus = null;
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onClose.emit();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = this.getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    return Array.from(
      (this.el.nativeElement as HTMLElement).querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  private focusFirstButton(): void {
    const button = (this.el.nativeElement as HTMLElement).querySelector('button');
    button?.focus();
  }
}
