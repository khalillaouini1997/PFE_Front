import { inject } from '@angular/core';
import { Router, CanMatchFn, Route, UrlSegment } from '@angular/router';
import { STORAGE_KEYS } from '../shared/constants';

export const authGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
    const router = inject(Router);

    const isAuthenticated = localStorage.getItem(STORAGE_KEYS.AUTH_STATUS) === 'true';

    if (!isAuthenticated) {
        return router.parseUrl('/authentification');
    }

    return true;
};
