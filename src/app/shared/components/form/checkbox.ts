import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  imports: [FormsModule],
  templateUrl: './checkbox.html'
})
export class Checkbox {
  readonly checked = model(false);
  readonly label = input.required<string>();
}
