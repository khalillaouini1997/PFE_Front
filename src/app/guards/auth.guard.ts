import {inject} from '@angular/core';
import {CanMatchFn, Route, Router, UrlSegment, UrlTree} from '@angular/router';
import {catchError, map, Observable, of} from 'rxjs';
import {AuthService} from '../service/auth.service';

export const authGuard: CanMatchFn = (_route: Route, _segments: UrlSegment[]): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.checkAuth().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      return router.parseUrl('/authentification');
    }),
    catchError(() => {
      return of(router.parseUrl('/authentification'));
    })
  );
};
