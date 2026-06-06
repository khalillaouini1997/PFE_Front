import { Injectable, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { CompteServer } from "../data/data";
import { Observable } from "rxjs";
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CompteServerService {

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  // Compte Server CRUD
  createServerCompte(compteServer: CompteServer): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}compteServer`, compteServer);
  }

  updateServerCompte(id: number, compteServer: CompteServer): Observable<any> {
    return this.http.put<any>(`${environment.apiBaseUrl}compteServer/${id}`, compteServer);
  }

  deleteCompteServer(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}compteServer/${id}`);
  }

  getAllServerCompte(keyword: string, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer?keyWord=${keyword}&page=${page}&size=${size}`);
  }

  getCompteServerById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer/${id}`);
  }

  // Boitier related to Server
  addBoitiers(idCompteServer: number, nbrBoitiers: number): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}compteServer/${idCompteServer}?nombreBoitier=${nbrBoitiers}`, null);
  }

  getAllBoitierofIdcompte(idCompteServer: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer/${idCompteServer}/listBoitiers`);
  }

  extendIntervalOfBoitiers(idCompteServer: number): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}compteServer/${idCompteServer}/newInterval`, null);
  }

  // Web Admin perspective
  getAllServerAccount(keyWord: string, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer?keyWord=${keyWord}&page=${page}&size=${size}&userName=${this.authService.getCurrentUserName()}`);
  }

  getServerAccountById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer/${id}`);
  }

  getAllServerAccountForForm(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}compteServer/AllNames?userName=${this.authService.getCurrentUserName()}`);
  }

  createServerComptewithBoitier(compteServer: CompteServer, nbrBoitiers: number): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}compteServer/addNewComptewithBoitier?nombreBoitier=${nbrBoitiers}&username=${this.authService.getCurrentUserName()}`, compteServer);
  }

  // Misc
  isExistPseudo(pseudo: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer/pseudo?pseudo=${pseudo}`);
  }

  isExistLogin(login: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer/login?login=${login}`);
  }

  ExportListComptesServer(comptesServer: CompteServer[]): Observable<Blob> {
    return this.http.post(`${environment.apiBaseUrl}compteServer/export`, comptesServer, { responseType: 'blob' });
  }
}
