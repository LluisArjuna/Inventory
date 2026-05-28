import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField } from './form-field';

@Component({
  selector: 'app-text-input',
  imports: [FormsModule, FormField],
  templateUrl: './text-input.html'
})
export class TextInput {
  readonly value = model<string>();
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly type = input<'text' | 'number'>('text');
  readonly required = input(false);
}
