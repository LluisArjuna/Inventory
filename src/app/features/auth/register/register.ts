import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  error = signal<string | null>(null);
  submitting = signal(false);

  async onSubmit(): Promise<void> {
    this.error.set(null);

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Passwords do not match');
      return;
    }

    if (this.password().length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.submitting.set(true);

    try {
      await this.auth.registerWithEmail(this.email(), this.password());
      await this.router.navigate(['/']);
    } catch (err) {
      this.error.set(this.getErrorMessage(err));
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
      this.error.set(this.getErrorMessage(err));
    } finally {
      this.submitting.set(false);
    }
  }

  private getErrorMessage(err: unknown): string {
    const code = (err as { code?: string })?.code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email already registered';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/weak-password':
        return 'Password too weak';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled';
      default:
        return 'An unexpected error occurred';
    }
  }
}
