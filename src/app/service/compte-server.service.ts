import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CompteServer} from "../data/data";
import {Observable} from "rxjs";
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompteServerService {

  private readonly http = inject(HttpClient);

  // Compte Server CRUD
  updateServerCompte(id: number, compteServer: CompteServer): Observable<any> {
    return this.http.put<any>(`${environment.apiBaseUrl}compteServer/${id}`, compteServer);
  }

  deleteCompteServer(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}compteServer/${id}`);
  }

  getAllServerAccount(keyWord: string, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer?keyWord=${keyWord}&page=${page}&size=${size}`);
  }

  getCompteServerById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer/${id}`);
  }

  // Boitier related to Server
  addBoitiers(idCompteServer: number, nbrBoitiers: number): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}compteServer/${idCompteServer}?nombreBoitier=${nbrBoitiers}`, null);
  }

  getAllBoitierofIdcompte(idCompteServer: number, page: number = 0, size: number = 10000): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer/${idCompteServer}/Boitiers?page=${page}&size=${size}`);
  }

  extendIntervalOfBoitiers(idCompteServer: number): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}compteServer/${idCompteServer}/newInterval`, null);
  }

  getAllServerAccountForForm(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}compteServer/AllNames`);
  }

  createServerComptewithBoitier(compteServer: CompteServer, nbrBoitiers: number): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}compteServer/addNewComptewithBoitier?nombreBoitier=${nbrBoitiers}`, compteServer);
  }

  // Misc
  isExistPseudo(pseudo: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer/pseudo?pseudo=${pseudo}`);
  }

  isExistLogin(login: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}compteServer/login?login=${login}`);
  }

  ExportListComptesServer(comptesServer: CompteServer[]): Observable<Blob> {
    return this.http.post(`${environment.apiBaseUrl}compteServer/export`, comptesServer, {responseType: 'blob'});
  }
}
