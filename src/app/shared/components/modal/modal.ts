import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html'
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
}
