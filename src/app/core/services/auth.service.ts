import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Auth
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { User } from '@shared/models';
import { ApiService } from './api.service';

interface AuthResponse {
  token: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  private readonly app: FirebaseApp = initializeApp(environment.firebase);
  private readonly auth: Auth = getAuth(this.app);

  private readonly userSignal = signal<User | null>(null);
  private readonly loadingSignal = signal(true);

  readonly currentUser = this.userSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  constructor() {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    const id = localStorage.getItem('user_id');

    if (token && email && id) {
      this.userSignal.set({ id, email });
    }

    onAuthStateChanged(this.auth, (firebaseUser) => {
      if (!firebaseUser && !this.userSignal()) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_id');
      }
      this.loadingSignal.set(false);
    });
  }

  async registerWithEmail(email: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.syncWithBackend(credential.user);
  }

  async loginWithEmail(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    await this.syncWithBackend(credential.user);
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);
    await this.syncWithBackend(credential.user);
  }

  private async syncWithBackend(firebaseUser: FirebaseUser): Promise<void> {
    const idToken = await firebaseUser.getIdToken();

    const auth = await firstValueFrom(
      this.api.create<AuthResponse>('/auth/firebase', { token: idToken })
    );

    this.setSession(auth.token, firebaseUser.uid, firebaseUser.email ?? '');
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    this.userSignal.set(null);
    await this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setSession(token: string, id: string, email: string): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_id', id);
    this.userSignal.set({ id, email });
  }
}
