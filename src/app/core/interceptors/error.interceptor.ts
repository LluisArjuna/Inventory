import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';

const SKIP_PATHS = ['/auth/firebase'];

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  if (SKIP_PATHS.some(p => request.url.includes(p))) {
    return next(request);
  }

  return next(request).pipe(
    catchError((err) => {
      const toast = inject(ToastService);

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
