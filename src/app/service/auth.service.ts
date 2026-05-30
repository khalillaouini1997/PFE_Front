import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AdministratorCompte } from '../data/data';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly http = inject(HttpClient);
    private readonly TOKEN_KEY = 'token';
    private readonly USER_KEY = 'currentUser';
    private readonly AUTH_STATUS_KEY = 'isAuthenticate';
    private readonly TOKEN_PREFIX = 'rimtel ';

    currentUser: AdministratorCompte | null = null;

    authentificate(login: string, password: string): Observable<any> {
        const body = { username: login, password: password };
        return this.http.post<any>(`${environment.apiBaseUrl}authenticate`, body);
    }

    saveSession(authResponse: any) {
        // Token is now stored in httpOnly cookie by the backend
        // Only store user data and auth status in localStorage
        localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse));
        localStorage.setItem(this.AUTH_STATUS_KEY, 'true');
        this.currentUser = authResponse;
    }

    logout() {
        // Clear cookie by setting it to expire
        document.cookie = 'jwt_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.AUTH_STATUS_KEY);
        this.currentUser = null;
    }

    getToken(): string | null {
        // Token is now in httpOnly cookie, not accessible from JavaScript
        return null;
    }

    isAuthenticated(): boolean {
        return localStorage.getItem(this.AUTH_STATUS_KEY) === 'true';
    }

    getCurrentUser(): any {
        if (this.currentUser) return this.currentUser;
        const userStr = localStorage.getItem(this.USER_KEY);
        if (userStr) {
            this.currentUser = JSON.parse(userStr);
            return this.currentUser;
        }
        return null;
    }

    getCurrentUserName(): string | null {
        return this.getCurrentUser()?.user?.username ?? null;
    }

    isAgentAdmin(): boolean {
        const user = this.getCurrentUser()?.user;
        return user?.role === 'GLOBALADMINDESC' || user?.role === 'WEBADMIN';
    }

    hasRole(role: string): boolean {
        return this.getCurrentUser()?.user?.role === role;
    }
}
