import { inject } from '@angular/core';
import { Router, type CanActivateFn, type UrlTree } from '@angular/router';
import { interval, map, filter, take, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

const waitForAuth = (auth: AuthService, router: Router): Observable<boolean | UrlTree> =>
  interval(30).pipe(
    filter(() => !auth.isLoading()),
    take(1),
    map(() => auth.currentUser() ? true : router.parseUrl('/login'))
  );

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoading()) {
    return waitForAuth(auth, router);
  }

  if (auth.currentUser()) {
    return true;
  }

  return router.parseUrl('/login');
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoading()) {
    return waitForAuth(auth, router).pipe(
      map(() => auth.currentUser() ? router.parseUrl('/') : true)
    );
  }

  if (auth.currentUser()) {
    return router.parseUrl('/');
  }

  return true;
};
