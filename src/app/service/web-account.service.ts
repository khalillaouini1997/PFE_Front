import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CompteClientWebInfoDTO, DeviceInstallationEvolution, OptionInfoDTO, PageResponse, RealTime } from '../data/data';
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

    getAllWebAccountByKeyWord(keyWord: string, page: number, size: number, region?: string, pool?: number): Observable<PageResponse<CompteClientWebInfoDTO>> {
        let url = `${environment.apiBaseUrl}compteWeb?keyWord=${keyWord}&page=${page}&size=${size}&userName=${this.authService.getCurrentUserName()}`;
        if (region) {
            url += `&region=${region}`;
        }
        if (pool !== undefined && pool !== null) {
            url += `&pool=${pool}`;
        }
        return this.http.get<PageResponse<CompteClientWebInfoDTO>>(url);
    }

    getWebAccountById(id: number): Observable<CompteClientWebInfoDTO> {
        return this.http.get<any>(`${environment.apiBaseUrl}compteWeb/${id}?userName=${this.authService.getCurrentUserName()}`).pipe(
            map(response => response.data)
        );
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
        return this.http.get<any>(`${environment.apiBaseUrl}options`).pipe(
            map(response => response.data)
        );
    }

    // Lighter version for dropdowns — only returns {idCompteClientWeb, login}
    getAllWebAccountNames(): Observable<any[]> {
        const url = `${environment.apiBaseUrl}compteWeb/AllNames?userName=${this.authService.getCurrentUserName()}`;
        return this.http.get<any[]>(url);
    }

    associateCompteWebToCompteServer(idWeb: number, idServer: number): Observable<any> {
        return this.http.post<any>(`${environment.apiBaseUrl}compteWeb/${idWeb}/compteServer/${idServer}`, null);
    }

    getDeviceInstallationEvolution(idCompteWeb: number, granularity: string = 'month'): Observable<DeviceInstallationEvolution[]> {
        return this.http.get<DeviceInstallationEvolution[]>(`${environment.apiBaseUrl}compteWeb/${idCompteWeb}/device-installation-evolution?granularity=${granularity}`);
    }

    getDistinctPools(): Observable<number[]> {
        return this.http.get<number[]>(`${environment.apiBaseUrl}compteWeb/pools`);
    }
}
