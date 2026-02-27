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
  private headers: HttpHeaders;

  ips: IpAddress[] = [];

  constructor(private _http: HttpClient, private dataService: DataService) { }

  authentificate(login: string, password: string): Observable<any> {
    const body = { username: login, password: password };
    return this._http.post<any>(`${dns}authenticate`, body).pipe(map(res => res));
  }


  private getHeaders() {
    this.headers = new HttpHeaders()
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    const token = this.loadToken();
    if (token) {
      this.headers = this.headers.set('Authorization', token);
    }

    return this.headers;
  }


  // Boitier CRUD methods...
  addBoitiers(idCompteServer: number, nbrBoitiers: number): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.post<any>(`${dns}compteServer/${idCompteServer}?nombreBoitier=${nbrBoitiers}`, null, options);
  }

  updateBoitier(boitier: Boitier, idServer: number, updateType: string): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.put<any>(`${dns}boities?idServer=${idServer}&updateType=${updateType}`, boitier, options);
  }

  deleteCompteServer(id: number): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.delete<any>(`${dns}compteServer/${id}`, options);
  }

  getRaws(numBoitier: number, limit: number): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.get<any>(`${dns}boities/${numBoitier}/Raw/${limit}`, options);
  }

  lastArchiveOfBoitier(numBoitier: number): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.get<any>(`${dns}boities/${numBoitier}/lastArchive`, options);
  }

  getArchiveOfBoitier(numboitier: number, limit: number): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.get<any>(`${dns}boities/${numboitier}/Archives/${limit}`, options);
  }

  createServerCompte(compteServer: CompteServer): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.post<any>(`${dns}compteServer`, compteServer, options);
  }

  updateServerCompte(id: number, compteServer: CompteServer): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.put<any>(`${dns}compteServer/${id}`, compteServer, options);
  }



  getAllServerCompte(keyword: string, page: number, size: number): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.get<any>(`${dns}compteServer?keyWord=${keyword}&page=${page}&size=${size}`, options);
  }


  // IP Address CRUD methods...
  saveIpAddress<T>(ipAddress: T): Observable<T> {
    const options = { headers: this.getHeaders() };
    return this._http.post<T>(`${dns}ips`, ipAddress, options);
  }

  getAllIpAddresses(keyword: string, page: number, size: number): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.get<any>(`${dns}ips/all?keyWord=${keyword}&page=${page}&size=${size}`, options);
  }

  deleteIpAddress(id: number): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.delete<any>(`${dns}ips/${id}`, options);
  }

  updateIpAddress(id: number, ipAddress: IpAddress): Observable<any> {
    const options = { headers: this.getHeaders() };
    return this._http.put<any>(`${dns}ips/${id}`, ipAddress, options);
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
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}/compteServer/pseudo?pseudo=${pseudo}`, { headers });
  }

  isExistLogin(login: string): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}/compteServer/login?login=${login}`, { headers });
  }

  ExportListComptesServer(comptesServer: CompteServer[]): Observable<any> {
    const headers = this.getHeaders();
    return this._http.post<any>(`${dns}/compteServerWeb/export`, comptesServer, { headers });
  }

  getAllServerAccount(keyWord: string, page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}/compteServerWeb?keyWord=${keyWord}&page=${page}&size=${size}&userName=${this.dataService.getCurrentUserName()}`, { headers });
  }

  getAllCompteClientServer(): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}/compteServer/All`, { headers });
  }

  getAllBoitierofIdcompte(idCompteServer: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}/compteServer/${idCompteServer}/listBoitiers`, { headers });
  }

  getAllServerAccountForForm(): Observable<any> {
    const headers = this.getHeaders();
    const keyWord = "";
    return this._http.get<any>(`${dns}/compteServerWeb?keyWord=${keyWord}&size=1000000&userName=${this.dataService.getCurrentUserName()}`, { headers });
  }

  extendIntervalOfBoitiers(idCompteServer: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.put<any>(`${dns}/compteServer/${idCompteServer}/newInterval`, null, { headers });
  }

  getBoitierOfAccount(keyWord: string, id: number, page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}/compteServer/${id}/Boitiers?keyWord=${keyWord}&page=${page}&size=${size}`, { headers });
  }

  getCompteServerById(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}/compteServer/${id}`, { headers });
  }

  getServerAccountById(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get<any>(`${dns}/compteServerWeb/${id}`, { headers });
  }

}
