import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  readonly label = input.required<string>();
  readonly required = input(false);
}
