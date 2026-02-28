import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AdministratorCompte, PageResponse } from '../data/data';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AdminAccountService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);

    getAllAdminComptesByKeyWord(keyWord: string, page: number, size: number): Observable<PageResponse<AdministratorCompte>> {
        if (this.authService.isAgentAdmin()) {
            return this.http.get<PageResponse<AdministratorCompte>>(`${environment.apiBaseUrl}adminCompteWeb/all?keyWord=${keyWord}&page=${page}&size=${size}`);
        } else {
            return throwError(() => new Error("Not authorized to access administrator accounts."));
        }
    }

    addAdminCompte(adminCompte: AdministratorCompte): Observable<AdministratorCompte> {
        if (this.authService.isAgentAdmin()) {
            return this.http.post<AdministratorCompte>(`${environment.apiBaseUrl}adminCompteWeb/add`, adminCompte);
        } else {
            return throwError(() => new Error("Not authorized to add administrator accounts."));
        }
    }

    getAllAdministratorCompteService(keyWord: string, page: number, size: number): Observable<PageResponse<AdministratorCompte>> {
        if (this.authService.isAgentAdmin()) {
            return this.http.get<PageResponse<AdministratorCompte>>(`${environment.apiBaseUrl}adminCompteWeb?keyWord=${keyWord}&page=${page}&size=${size}`);
        } else {
            return throwError(() => new Error("Not authorized to access administrator accounts."));
        }
    }
}
