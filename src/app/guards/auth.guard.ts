import { inject } from '@angular/core';
import { Router, CanMatchFn, Route, UrlSegment } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    sub: string;
    exp: number;
    iat: number;
    role?: string;
    [key: string]: any;
}

export const authGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
    const router = inject(Router);

    // Check authentication status from localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticate') === 'true';

    if (!isAuthenticated) {
        return router.parseUrl('/authentification');
    }

    // Token is now in httpOnly cookie, browser handles it automatically
    // We can't validate it client-side, so we rely on server validation
    // If the token is invalid/expired, the server will return 401 and we can handle it there
    return true;
};
