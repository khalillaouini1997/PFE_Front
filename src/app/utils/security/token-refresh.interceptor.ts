import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../service/auth.service';

let isRefreshing = false;

export const tokenRefreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Skip token refresh for auth endpoints
  if (req.url.includes('/auth') || req.url.includes('/login') || req.url.includes('/authenticate')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 error and not already refreshing
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        // For now, just logout on 401 since refreshToken doesn't exist yet
        // This can be enhanced when backend supports token refresh
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};
