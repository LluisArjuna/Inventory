import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { GoogleSignIn } from '@shared/components/google-sign-in/google-sign-in';
import { OrDivider } from '@shared/components/or-divider/or-divider';
import { getAuthErrorMessage } from '@shared/utils/auth-errors.utils';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, GoogleSignIn, OrDivider],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = signal('');
  password = signal('');
  error = signal<string | null>(null);
  submitting = signal(false);

  async onSubmit(): Promise<void> {
    this.error.set(null);
    this.submitting.set(true);

    try {
      await this.auth.loginWithEmail(this.email(), this.password());
      await this.router.navigate(['/']);
    } catch (err) {
      this.error.set(getAuthErrorMessage(err));
    } finally {
      this.submitting.set(false);
    }
  }

  async onGoogleSignIn(): Promise<void> {
    this.error.set(null);
    this.submitting.set(true);

    try {
      await this.auth.loginWithGoogle();
      await this.router.navigate(['/']);
    } catch (err) {
      this.error.set(getAuthErrorMessage(err));
    } finally {
      this.submitting.set(false);
    }
  }
}
