import { Component, input, output } from '@angular/core';
import { ActionButtons } from './action-buttons';


@Component({
  selector: 'app-form',
  imports: [ActionButtons],
  templateUrl: './form.html'
})
export class Form {
  readonly title = input('');
  readonly disabled = input(false);
  readonly valid = input(true);
  readonly loading = input(false);
  readonly submitText = input('Submit');
  readonly loadingText = input('Submitting...');

  readonly cancel = output<void>();
  readonly submit = output<void>();
}
