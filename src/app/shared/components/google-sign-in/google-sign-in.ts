import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-google-sign-in',
  templateUrl: './google-sign-in.html'
})
export class GoogleSignIn {
  readonly disabled = input(false);
  readonly signIn = output<void>();
}
