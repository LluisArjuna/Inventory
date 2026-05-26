import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html'
})
export class Modal {
  readonly open = input(false);
  readonly onClose = output<void>();
}
