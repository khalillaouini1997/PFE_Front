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
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
        return router.parseUrl('/authentification');
    }
    
    // Remove prefix if present
    const tokenWithoutPrefix = token.replace('rimtel ', '');
    
    try {
        // Decode and verify token
        const decoded: JwtPayload = jwtDecode(tokenWithoutPrefix);
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
            // Token expired, clear localStorage and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isAuthenticate');
            return router.parseUrl('/authentification');
        }
        
        // Check if route requires specific role
        const requiredRole = route.data?.['role'];
        if (requiredRole && decoded.role !== requiredRole) {
            // User doesn't have required role
            return router.parseUrl('/authentification');
        }
        
        return true;
    } catch (error) {
        // Invalid token, clear localStorage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticate');
        return router.parseUrl('/authentification');
    }
};
