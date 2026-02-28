import { inject } from '@angular/core';
import { Router, CanMatchFn, Route, UrlSegment } from '@angular/router';
import { AuthentificationService } from '../authentification/authentification.service';

export const authGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
    const router = inject(Router);
    const isAuthenticate = localStorage.getItem('isAuthenticate') === 'true';

    if (isAuthenticate) {
        return true;
    }

    // Redirect to login if not authenticated
    return router.parseUrl('/authentification');
};
