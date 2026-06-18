import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';
import { API_ROUTES } from '../constants/api-routes';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const toast = inject(ToastService);

  if (request.url.includes(API_ROUTES.AUTH.FIREBASE)) {
    return next(request);
  }

  return next(request).pipe(
    catchError((err) => {

      if (err.error?.message) {
        toast.error(err.error.message);
      } else if (err.status === 0) {
        toast.error('Network error — check your connection');
      } else {
        toast.error(err.statusText || 'Something went wrong');
      }

      return throwError(() => err);
    })
  );
};
