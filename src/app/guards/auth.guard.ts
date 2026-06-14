import { inject } from '@angular/core';
import { Router, CanMatchFn, Route, UrlSegment } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const authGuard: CanMatchFn = (route: Route, segments: UrlSegment[]): Observable<boolean> => {
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
