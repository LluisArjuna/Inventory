import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.html'
})
export class ActionButtons {
  readonly disabled = input(false);
  readonly valid = input(true);
  readonly loading = input(false);
  readonly submitText = input('Submit');
  readonly loadingText = input('Submitting...');
  readonly cancelText = input('Cancel');

  readonly cancel = output<void>();
  readonly submit = output<void>();
}
