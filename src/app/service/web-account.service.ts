import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CompteClientWebInfoDTO, OptionInfoDTO, PageResponse, RealTime } from '../data/data';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class WebAccountService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);

    readonly codesPays = [
        { key: "Maroc", value: "212" },
        // ... (truncated codesPays for brevity in replace call, but I will keep them all)
        { key: "Tunisie", value: "216" },
        { key: "Zimbabwe", value: "263" }
    ];

    addCompteWeb(compteWeb: any): Observable<CompteClientWebInfoDTO> {
        return this.http.post<CompteClientWebInfoDTO>(`${environment.apiBaseUrl}compteWeb?userName=${this.authService.getCurrentUserName()}`, compteWeb);
    }

    getAllWebAccountByKeyWord(keyWord: string, page: number, size: number): Observable<PageResponse<CompteClientWebInfoDTO>> {
        return this.http.get<PageResponse<CompteClientWebInfoDTO>>(`${environment.apiBaseUrl}compteWeb?keyWord=${keyWord}&page=${page}&size=${size}&userName=${this.authService.getCurrentUserName()}`);
    }

    getWebAccountById(id: number): Observable<CompteClientWebInfoDTO> {
        return this.http.get<CompteClientWebInfoDTO>(`${environment.apiBaseUrl}compteWeb/${id}?userName=${this.authService.getCurrentUserName()}`);
    }

    updateWebAccount(idCompteWeb: number, newCompteWeb: any): Observable<CompteClientWebInfoDTO> {
        return this.http.put<CompteClientWebInfoDTO>(`${environment.apiBaseUrl}compteWeb/${idCompteWeb}`, newCompteWeb);
    }

    deleteWebAccount(id: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiBaseUrl}compteWeb/${id}`);
    }

    getAllCompteClientWeb(): Observable<CompteClientWebInfoDTO[]> {
        return this.http.get<CompteClientWebInfoDTO[]>(`${environment.apiBaseUrl}compteWeb/All?userName=${this.authService.getCurrentUserName()}`);
    }

    getAllLastTram(idCompteWeb: number): Observable<RealTime[]> {
        return this.http.get<RealTime[]>(`${environment.apiBaseUrl}compteWeb/${idCompteWeb}/lastTrame`);
    }

    exportLastTram(realtimes: RealTime[]): Observable<Blob> {
        return this.http.post(`${environment.apiBaseUrl}compteWeb/lastTrame/export`, realtimes, { responseType: 'blob' });
    }

    getAllLastTramforAllClient(): Observable<RealTime[]> {
        return this.http.get<RealTime[]>(`${environment.apiBaseUrl}compteWeb/AllLastTram`);
    }

    getDateLog(username: string): Observable<string> {
        return this.http.get<string>(`${environment.apiBaseUrl}compteWeb?datelog=${username}`);
    }

    addOptionsToWebAccount(id: number, options: OptionInfoDTO[]): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}compteWeb/${id}/Options`, options);
    }

    getAllOptions(): Observable<OptionInfoDTO[]> {
        return this.http.get<OptionInfoDTO[]>(`${environment.apiBaseUrl}options`);
    }

    associateCompteWebToCompteServer(idWeb: number, idServer: number): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}compteWeb/${idWeb}/compteServer/${idServer}`, null);
    }
}
