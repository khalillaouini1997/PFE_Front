import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AdministratorCompte, Boitier, CompteServer, CompteWeb, IpAddress } from "../data/data";
import { Observable } from "rxjs";
import { dns } from "../global.config";
import { map } from "rxjs/operators";
import * as jwt_decode from "jwt-decode";
import { JsonPipe } from '@angular/common';
import { DataService } from './data.service';


@Injectable({
  providedIn: 'root'
})
export class CompteServerService {

  isAuthenticated: boolean = false;
  USER_TOKEN: string = "";
  TOKEN_PREFIX: string = "Bearer ";

  ips: IpAddress[] = [];

  constructor(private _http: HttpClient, private dataService: DataService) { }

  authentificate(login: string, password: string): Observable<any> {
    const body = { username: login, password: password };
    return this._http.post<any>(`${dns}authenticate`, body).pipe(map(res => res));
  }




  // Boitier CRUD methods...
  addBoitiers(idCompteServer: number, nbrBoitiers: number): Observable<any> {

    return this._http.post<any>(`${dns}compteServer/${idCompteServer}?nombreBoitier=${nbrBoitiers}`, null);
  }

  updateBoitier(boitier: Boitier, idServer: number, updateType: string): Observable<any> {

    return this._http.put<any>(`${dns}boities?idServer=${idServer}&updateType=${updateType}`, boitier);
  }

  deleteCompteServer(id: number): Observable<any> {

    return this._http.delete<any>(`${dns}compteServer/${id}`);
  }

  getRaws(numBoitier: number, limit: number): Observable<any> {

    return this._http.get<any>(`${dns}boities/${numBoitier}/Raw/${limit}`);
  }

  lastArchiveOfBoitier(numBoitier: number): Observable<any> {

    return this._http.get<any>(`${dns}boities/${numBoitier}/lastArchive`);
  }

  getArchiveOfBoitier(numboitier: number, limit: number): Observable<any> {

    return this._http.get<any>(`${dns}boities/${numboitier}/Archives/${limit}`);
  }

  createServerCompte(compteServer: CompteServer): Observable<any> {

    return this._http.post<any>(`${dns}compteServer`, compteServer);
  }

  updateServerCompte(id: number, compteServer: CompteServer): Observable<any> {

    return this._http.put<any>(`${dns}compteServer/${id}`, compteServer);
  }



  getAllServerCompte(keyword: string, page: number, size: number): Observable<any> {

    return this._http.get<any>(`${dns}compteServer?keyWord=${keyword}&page=${page}&size=${size}`);
  }


  // IP Address CRUD methods...
  saveIpAddress<T>(ipAddress: T): Observable<T> {

    return this._http.post<T>(`${dns}ips`, ipAddress);
  }

  getAllIpAddresses(keyword: string, page: number, size: number): Observable<any> {

    return this._http.get<any>(`${dns}ips/all?keyWord=${keyword}&page=${page}&size=${size}`);
  }

  deleteIpAddress(id: number): Observable<any> {

    return this._http.delete<any>(`${dns}ips/${id}`);
  }

  updateIpAddress(id: number, ipAddress: IpAddress): Observable<any> {

    return this._http.put<any>(`${dns}ips/${id}`, ipAddress);
  }


  // Other methods...

  // Token and authentication methods...
  saveTokenInStorage(token: string, isAuthenticated: boolean) {
    this.USER_TOKEN = this.TOKEN_PREFIX + token;
    localStorage.setItem("token", this.USER_TOKEN);
    localStorage.setItem("id_token", token);
    localStorage.setItem("isAuthenticate", "" + isAuthenticated);
  }

  loadToken(): string | null {
    return localStorage.getItem("token");
  }

  loadTestAuthenticated(): boolean {
    let isAuthenticated: string | null = localStorage.getItem("isAuthenticate");
    return isAuthenticated === "true";
  }


  logoutStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("isAuthenticate");
  }

  isExistPseudo(pseudo: string): Observable<any> {

    return this._http.get<any>(`${dns}/compteServer/pseudo?pseudo=${pseudo}`);
  }

  isExistLogin(login: string): Observable<any> {

    return this._http.get<any>(`${dns}/compteServer/login?login=${login}`);
  }

  ExportListComptesServer(comptesServer: CompteServer[]): Observable<any> {

    return this._http.post<any>(`${dns}/compteServerWeb/export`, comptesServer);
  }

  getAllServerAccount(keyWord: string, page: number, size: number): Observable<any> {

    return this._http.get<any>(`${dns}/compteServerWeb?keyWord=${keyWord}&page=${page}&size=${size}&userName=${this.dataService.getCurrentUserName()}`);
  }

  getAllCompteClientServer(): Observable<any> {

    return this._http.get<any>(`${dns}/compteServer/All`);
  }

  getAllBoitierofIdcompte(idCompteServer: number): Observable<any> {

    return this._http.get<any>(`${dns}/compteServer/${idCompteServer}/listBoitiers`);
  }

  getAllServerAccountForForm(): Observable<any> {

    const keyWord = "";
    return this._http.get<any>(`${dns}/compteServerWeb?keyWord=${keyWord}&size=1000000&userName=${this.dataService.getCurrentUserName()}`);
  }

  extendIntervalOfBoitiers(idCompteServer: number): Observable<any> {

    return this._http.put<any>(`${dns}/compteServer/${idCompteServer}/newInterval`, null);
  }

  getBoitierOfAccount(keyWord: string, id: number, page: number, size: number): Observable<any> {

    return this._http.get<any>(`${dns}/compteServer/${id}/Boitiers?keyWord=${keyWord}&page=${page}&size=${size}`);
  }

  getCompteServerById(id: number): Observable<any> {

    return this._http.get<any>(`${dns}/compteServer/${id}`);
  }

  getServerAccountById(id: number): Observable<any> {

    return this._http.get<any>(`${dns}/compteServerWeb/${id}`);
  }

}
