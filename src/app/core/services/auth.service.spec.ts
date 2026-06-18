import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

const mockFirebaseUser = { uid: 'fb-uid', email: 'fb@test.com', getIdToken: vi.fn() };

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth: any, cb: any) => { cb(mockFirebaseUser); return vi.fn(); }),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: class {},
  signOut: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let api: { create: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    api = { create: vi.fn() };
    router = { navigate: vi.fn().mockResolvedValue(true) };
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: api },
        { provide: Router, useValue: router },
      ],
    });

    mockFirebaseUser.getIdToken.mockResolvedValue('fb-token');
    service = TestBed.inject(AuthService);
  });

  describe('constructor', () => {
    function createService() {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: ApiService, useValue: api },
          { provide: Router, useValue: router },
        ],
      });
      return TestBed.inject(AuthService);
    }

    it('restores session from localStorage', () => {
      localStorage.setItem('auth_token', 'jwt-1');
      localStorage.setItem('user_email', 'a@b.com');
      localStorage.setItem('user_id', 'uid-1');

      const svc = createService();

      expect(svc.currentUser()).toEqual({ id: 'uid-1', email: 'a@b.com' });
    });

    it('sets user to null when localStorage is empty', () => {
      const svc = createService();
      expect(svc.currentUser()).toBeNull();
    });
  });

  describe('getToken', () => {
    it('returns token from localStorage', () => {
      localStorage.setItem('auth_token', 'my-token');
      expect(service.getToken()).toBe('my-token');
    });

    it('returns null when no token stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('registerWithEmail', () => {
    it('creates Firebase user and syncs with backend', async () => {
      const createUser = vi.mocked(await import('firebase/auth')).createUserWithEmailAndPassword;
      vi.mocked(createUser).mockResolvedValue({ user: mockFirebaseUser } as any);
      api.create.mockReturnValue(of({ token: 'jwt-1', type: 'Bearer' }));

      await service.registerWithEmail('a@b.com', 'pass123');

      expect(createUser).toHaveBeenCalledWith(expect.anything(), 'a@b.com', 'pass123');
      expect(mockFirebaseUser.getIdToken).toHaveBeenCalled();
      expect(api.create).toHaveBeenCalledWith('/auth/firebase', { token: 'fb-token' });
      expect(localStorage.getItem('auth_token')).toBe('jwt-1');
      expect(service.currentUser()).toEqual({ id: 'fb-uid', email: 'fb@test.com' });
    });
  });

  describe('loginWithEmail', () => {
    it('signs in and syncs with backend', async () => {
      const signIn = vi.mocked(await import('firebase/auth')).signInWithEmailAndPassword;
      vi.mocked(signIn).mockResolvedValue({ user: mockFirebaseUser } as any);
      api.create.mockReturnValue(of({ token: 'jwt-2', type: 'Bearer' }));

      await service.loginWithEmail('a@b.com', 'pass456');

      expect(signIn).toHaveBeenCalledWith(expect.anything(), 'a@b.com', 'pass456');
      expect(localStorage.getItem('auth_token')).toBe('jwt-2');
    });
  });

  describe('loginWithGoogle', () => {
    it('signs in with popup and syncs with backend', async () => {
      const signInPopup = vi.mocked(await import('firebase/auth')).signInWithPopup;
      vi.mocked(signInPopup).mockResolvedValue({ user: mockFirebaseUser } as any);
      api.create.mockReturnValue(of({ token: 'jwt-3', type: 'Bearer' }));

      await service.loginWithGoogle();

      expect(signInPopup).toHaveBeenCalled();
      expect(localStorage.getItem('auth_token')).toBe('jwt-3');
    });
  });

  describe('logout', () => {
    it('signs out, clears storage, and navigates home', async () => {
      localStorage.setItem('auth_token', 'tok');
      localStorage.setItem('user_email', 'a@b.com');
      localStorage.setItem('user_id', 'u1');

      const signOut = vi.mocked(await import('firebase/auth')).signOut;
      vi.mocked(signOut).mockResolvedValue(undefined);

      await service.logout();

      expect(signOut).toHaveBeenCalled();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_email')).toBeNull();
      expect(localStorage.getItem('user_id')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
