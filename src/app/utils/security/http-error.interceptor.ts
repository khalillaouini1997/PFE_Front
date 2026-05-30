import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../service/auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid
        authService.logout();
        router.navigate(['/authentification']);
        return throwError(() => error);
      }

      if (error.status === 403) {
        // Forbidden - user doesn't have access
        router.navigate(['/error'], { queryParams: { code: 403 } });
        return throwError(() => error);
      }

      if (error.status === 404) {
        // Resource not found
        console.error(`Resource not found: ${req.url}`);
        return throwError(() => error);
      }

      if (error.status >= 500) {
        // Server error
        console.error('Server error:', error);
        return throwError(() => error);
      }

      // Network error
      if (!error.status && error.error instanceof ProgressEvent) {
        console.error('Network error - check your connection');
        return throwError(() => new Error('Network error. Please check your connection.'));
      }

      return throwError(() => error);
    })
  );
};
