import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField } from './form-field';

@Component({
  selector: 'app-text-area',
  imports: [FormsModule, FormField],
  templateUrl: './text-area.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextArea {
  readonly value = model<string>();
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly required = input(false);
}
