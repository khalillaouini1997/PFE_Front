import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AdministratorCompte } from '../data/data';
import { WebSocketService } from './web-socket.service';
import { STORAGE_KEYS } from '../shared/constants';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly http = inject(HttpClient);
    private readonly webSocketService = inject(WebSocketService);
    private readonly TOKEN_PREFIX = 'rimtel ';

    currentUser: AdministratorCompte | null = null;

    authentificate(login: string, password: string): Observable<any> {
        const body = { username: login, password: password };
        return this.http.post<any>(`${environment.apiBaseUrl}authenticate`, body);
    }

    refreshToken(): Observable<any> {
        return this.http.post<any>(`${environment.apiBaseUrl}refresh`, {});
    }

    saveSession(authResponse: any) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authResponse));
        localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'true');
        this.currentUser = authResponse;
    }

    logout() {
        document.cookie = 'jwt_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.AUTH_STATUS);
        this.currentUser = null;
        this.webSocketService.disconnect();
    }

    checkAuth(): Observable<boolean> {
        return this.http.get<any>(`${environment.apiBaseUrl}auth/me`).pipe(
            map(res => {
                if (res?.user) {
                    this.currentUser = res;
                    localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'true');
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res));
                    return true;
                }
                return false;
            }),
            catchError(() => {
                this.logout();
                return of(false);
            })
        );
    }

    isAuthenticated(): boolean {
        return localStorage.getItem(STORAGE_KEYS.AUTH_STATUS) === 'true';
    }

    getCurrentUser(): any {
        if (this.currentUser) return this.currentUser;
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
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
