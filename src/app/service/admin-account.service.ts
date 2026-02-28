import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AdministratorCompte } from '../data/data';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AdminAccountService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);

    getAllAdminComptesByKeyWord(keyWord: string, page: number, size: number): Observable<any> {
        if (this.authService.isAgentAdmin()) {
            return this.http.get<any>(`${environment.apiBaseUrl}adminCompteWeb/all?keyWord=${keyWord}&page=${page}&size=${size}`);
        } else {
            return throwError(() => new Error("Not authorized to access administrator accounts."));
        }
    }

    addAdminCompte(adminCompte: AdministratorCompte): Observable<any> {
        if (this.authService.isAgentAdmin()) {
            return this.http.post<any>(`${environment.apiBaseUrl}adminCompteWeb/add`, adminCompte);
        } else {
            return throwError(() => new Error("Not authorized to add administrator accounts."));
        }
    }

    getAllAdministratorCompteService(keyWord: string, page: number, size: number): Observable<any> {
        if (this.authService.isAgentAdmin()) {
            return this.http.get<any>(`${environment.apiBaseUrl}adminCompteWeb?keyWord=${keyWord}&page=${page}&size=${size}`);
        } else {
            return throwError(() => new Error("Not authorized to access administrator accounts."));
        }
    }
}
