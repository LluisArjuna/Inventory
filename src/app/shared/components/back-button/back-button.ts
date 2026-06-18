import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButton {
  private readonly router = inject(Router);

  readonly route = input.required<string[]>();
  readonly label = input.required<string>();

  goBack(): void {
    this.router.navigate(this.route());
  }
}
