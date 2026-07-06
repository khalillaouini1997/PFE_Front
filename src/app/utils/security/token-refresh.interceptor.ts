import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../service/auth.service';

let isRefreshing = false;
let refreshTokensSubject = new Subject<void>();

export const tokenRefreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip token refresh for auth endpoints
  if (req.url.includes('/auth') || req.url.includes('/login') || req.url.includes('/authenticate') || req.url.includes('/refresh')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokensSubject = new Subject<void>();

          return authService.refreshToken().pipe(
            switchMap(() => {
              refreshTokensSubject.next();
              refreshTokensSubject.complete();
              refreshTokensSubject = new Subject<void>();
              isRefreshing = false;
              return next(req);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              refreshTokensSubject.complete();
              refreshTokensSubject = new Subject<void>();
              authService.logout();
              router.navigate(['/authentification']);
              return throwError(() => refreshError);
            })
          );
        }

        // Queue subsequent 401 requests to wait for the ongoing refresh
        return refreshTokensSubject.pipe(
          take(1),
          switchMap(() => next(req))
        );
      }

      return throwError(() => error);
    })
  );
};
