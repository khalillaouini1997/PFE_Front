import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CompteWeb, Option, PathConfigPayload, Tram } from '../data/data';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class WebAccountService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);

    readonly codesPays = [
        { key: "Maroc", value: "212" },
        { key: "Afrique du Sud", value: "27" },
        { key: "Algérie", value: "213" },
        { key: "Angola", value: "244" },
        { key: "Bénin", value: "229" },
        { key: "Botswana", value: "267" },
        { key: "Burkina Faso", value: "226" },
        { key: "Burundi", value: "257" },
        { key: "Cameroun", value: "237" },
        { key: "Cap Vert", value: "238" },
        { key: "Comores", value: "269" },
        { key: "Côte d'Ivoire", value: "225" },
        { key: "Djibouti", value: "253" },
        { key: "Égypte", value: "20" },
        { key: "Éthiopie", value: "251" },
        { key: "Gabon", value: "241" },
        { key: "Gambie", value: "220" },
        { key: "Ghana", value: "233" },
        { key: "Guinée", value: "224" },
        { key: "Guinée Bisseau", value: "245" },
        { key: "Guinée Équatoriale", value: "240" },
        { key: "Kenya", value: "254" },
        { key: "Lesotho", value: "266" },
        { key: "Lybie", value: "218" },
        { key: "Madagascar", value: "261" },
        { key: "Malawi", value: "265" },
        { key: "Maurice", value: "230" },
        { key: "Mauritanie", value: "222" },
        { key: "Mozambique", value: "258" },
        { key: "Namibie", value: "264" },
        { key: "Niger", value: "227" },
        { key: "Nigeria", value: "234" },
        { key: "Ouganda", value: "256" },
        { key: "République démocratique du Congo", value: "243" },
        { key: "République Congo", value: "242" },
        { key: "Rwanda", value: "250" },
        { key: "Sao Tome-et-Principe", value: "239" },
        { key: "Sénégal", value: "221" },
        { key: "Seychelles", value: "248" },
        { key: "Sierra Leone", value: "232" },
        { key: "Somalie", value: "252" },
        { key: "Soudan", value: "249" },
        { key: "Swaziland", value: "268" },
        { key: "Tanzanie", value: "255" },
        { key: "Tchad", value: "235" },
        { key: "Togo", value: "228" },
        { key: "Tunisie", value: "216" },
        { key: "Zimbabwe", value: "263" }
    ];

    addCompteWeb(compteWeb: CompteWeb): Observable<any> {
        return this.http.post<any>(`${environment.apiBaseUrl}compteWeb?userName=${this.authService.getCurrentUserName()}`, compteWeb);
    }

    getAllWebAccountByKeyWord(keyWord: string, page: number, size: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}compteWeb?keyWord=${keyWord}&page=${page}&size=${size}&userName=${this.authService.getCurrentUserName()}`);
    }

    getWebAccountById(id: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}compteWeb/${id}?userName=${this.authService.getCurrentUserName()}`);
    }

    updateWebAccount(idCompteWeb: number, newCompteWeb: CompteWeb): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}compteWeb/${idCompteWeb}`, newCompteWeb);
    }

    deleteWebAccount(id: number): Observable<any> {
        return this.http.delete<any>(`${environment.apiBaseUrl}compteWeb/${id}`);
    }

    getAllCompteClientWeb(): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}compteWeb/All?userName=${this.authService.getCurrentUserName()}`);
    }

    getAllLastTram(idCompteWeb: number): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}compteWeb/${idCompteWeb}/lastTrame`);
    }

    exportLastTram(realtimes: Tram[]): Observable<Blob> {
        return this.http.post(`${environment.apiBaseUrl}compteWeb/lastTrame/export`, realtimes, { responseType: 'blob' });
    }

    getAllLastTramforAllClient(): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}compteWeb/AllLastTram`);
    }

    getDateLog(username: string): Observable<any> {
        return this.http.get(`${environment.apiBaseUrl}compteWeb?datelog=${username}`);
    }

    addOptionsToWebAccount(id: number, options: Option[]): Observable<any> {
        return this.http.post(`${environment.apiBaseUrl}compteWeb/${id}/Options`, options);
    }

    getAllOptions(): Observable<any> {
        return this.http.get<any>(`${environment.apiBaseUrl}options`);
    }

    associateCompteWebToCompteServer(idWeb: number, idServer: number): Observable<any> {
        return this.http.put<any>(`${environment.apiBaseUrl}compteWeb/${idWeb}/compteServer/${idServer}`, null);
    }
}
