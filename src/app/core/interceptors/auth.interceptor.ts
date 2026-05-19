import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

const AUTH_ENDPOINT = '/auth/firebase';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.url.includes(AUTH_ENDPOINT)) {
    return next(request);
  }

  const auth = inject(AuthService);
  const token = auth.getToken();

  if (token) {
    const cloned = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(request);
};
