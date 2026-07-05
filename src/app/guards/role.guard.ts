import { inject } from '@angular/core';
import { Router, CanMatchFn, Route, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../service/auth.service';

export function roleGuard(allowedRoles: string[]): CanMatchFn {
    return (route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> => {
        const router = inject(Router);
        const authService = inject(AuthService);

        const user = authService.getCurrentUser()?.user;
        const role = user?.role;

        if (role && allowedRoles.includes(role)) {
            return of(true);
        }

        return of(router.parseUrl('/adminWeb/dashboard'));
    };
}
