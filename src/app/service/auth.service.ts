import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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
    private readonly TOKEN_PREFIX = 'Bearer ';

    currentUser: AdministratorCompte | null = null;

    authentificate(login: string, password: string): Observable<any> {
        const loginRequest = {
            username: login,
            password: password
        };
        return this.http.post<any>(`${environment.apiBaseUrl}authenticate`, loginRequest);
    }

    saveSession(authResponse: any) {
        const token = authResponse.token;
        localStorage.setItem(this.TOKEN_KEY, this.TOKEN_PREFIX + token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse));
        localStorage.setItem(this.AUTH_STATUS_KEY, 'true');
        this.currentUser = authResponse;
    }

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.AUTH_STATUS_KEY);
        this.currentUser = null;
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
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
        const session = this.getCurrentUser();
        return session && session.user ? session.user.username : null;
    }

    isAgentAdmin(): boolean {
        const session = this.getCurrentUser();
        if (session && session.user && (session.user.role === 'GLOBALADMIN' || session.user.role === 'WEBADMIN')) {
            return true;
        }
        return false;
    }

    hasRole(role: string): boolean {
        const session = this.getCurrentUser();
        return session && session.user && session.user.role === role;
    }
}
