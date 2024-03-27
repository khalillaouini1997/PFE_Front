import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Boitier, CompteServer, IpAddress} from "../data/data";
import {Observable} from "rxjs";
import {dns} from "../global.config";
import {map} from "rxjs/operators";
import * as jwt_decode from "jwt-decode";


@Injectable({
  providedIn: 'root'
})
export class CompteServerService {

  isAuthenticated: boolean = false;
  USER_TOKEN: string = "";
  TOKEN_PREFIX: string = "rimtel ";
  private headers: HttpHeaders;

  ips: IpAddress[] = [];

  constructor(private _http: HttpClient) { }

  authentificate(login: string, password: string): Observable<any> {
    return this._http.post<any>(dns + "authenticate?username=" + login + "&password=" + password, null).pipe(map(res => res));
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
    let options = { headers: this.getHeaders() };
    return this._http.post<any>(dns + "compteServer/" + idCompteServer + "?nombreBoitier=" + nbrBoitiers, null, options);
  }

  updateBoitier(boitier: Boitier, idServer: number, updateType: string): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.put<any>(dns + "boities?idServer=" + idServer + "&updateType=" + updateType, boitier, options);
  }

  deleteCompteServer(id: number): void {
    let options = { headers: this.getHeaders() };
    this._http.delete(dns + "compteServer/" + id, options).subscribe(res => {
      // Handle response if needed
    });
  }

  lastArchiveOfBoitier(numBoitier: number): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.get<any>(dns + "boities/" + numBoitier + "/lastArchive", options);
  }

  // Compte Server CRUD methods...
  createServerCompte(compteServer: CompteServer): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.post<any>(dns + "compteServer", compteServer, options);
  }

  updateServerCompte(id: number, compteServer: CompteServer): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.put<any>(dns + "compteServer/" + id, compteServer, options);
  }

  createServerComptewithBoitier(compteServer: CompteServer, nbrBoitiers: number): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.post<any>(dns + "compteServer/addNewComptewithBoitier?nombreBoitier=" + nbrBoitiers + "&username=" + this.getCurrentUserName(), compteServer, options);
  }

  getAllServerCompte(keyword: string, page: number, size: number): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.get<any>(dns + "compteServer?keyWord=" + keyword + "&page=" + page + "&size=" + size, options);
  }

  // IP Address CRUD methods...
  saveIpAddress(ipAddress: IpAddress): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.post<any>(dns + "ips", ipAddress, options);
  }

  getAllIpAddresses(keyword: string, page: number, size: number): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.get<any>(dns + "ips/all?keyWord=" + keyword + "&page=" + page + "&size=" + size, options);
  }

  deleteIpAddress(id: number): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.delete<any>(dns + "ips/" + id, options);
  }

  updateIpAddress(id: number, ipAddress: IpAddress): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.put<any>(dns + "ips/" + id, ipAddress, options);
  }

  // Other methods...

  // Token and authentication methods...
  saveTokenInStorage(token: string, isAuthenticated: boolean) {
    this.USER_TOKEN = this.TOKEN_PREFIX + token;
    localStorage.setItem("tokenAdmin", this.USER_TOKEN);
    localStorage.setItem("isAuthenticateAdmin", "" + isAuthenticated);
  }

  loadToken(): string | null {
    return localStorage.getItem("tokenAdmin");
  }

  loadTestAuthenticated(): boolean {
    let isAuthenticated: string | null = localStorage.getItem("isAuthenticateAdmin");
    return isAuthenticated === "true";
  }


  logoutStorage() {
    localStorage.removeItem("tokenAdmin");
    localStorage.removeItem("isAuthenticateAdmin");
  }

  isExistPseudo(pseudo: String): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.get<any>(dns + "/compteServer/pseudo?pseudo=" + pseudo, options);
  }

  isExistLogin(login: String): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.get<any>(dns + "/compteServer/login?login=" + login, options);
  }

  ExportListComptesServer(comptesServer: CompteServer[]): Observable<any> {
    const headers = this.getHeaders();
    return this._http.post(dns + 'compteServerWeb/export', comptesServer, { headers });
  }

  getAllServerAccount(keyWord: string, page: number, size: number): Observable<any> {
    const headers = this.getHeaders();
    return this._http.get(dns + "compteServerWeb?keyWord=" + keyWord + "&page=" + page + "&size=" + size + "&userName=" + this.getCurrentUserName(), { headers });
  }

  //=================================================
// get All compte client server
//=================================================

  getAllCompteClientServer(): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.get(dns + "compteServer/All", options);
  }

  getAllBoitierofIdcompte(idCompteServer: number): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.get(dns + "compteServer/" + idCompteServer + "/listBoitiers", options);
  }

  getAllServerAccountForForm(): Observable<any> {
    let options = { headers: this.getHeaders() };
    let keyWord = "";
    return this._http.get(dns + "compteServerWeb?keyWord=" + keyWord + "&size=" + 1000000 + "&userName=" + this.getCurrentUserName(), options);
  }

  extendIntervalOfBoitiers(idCompteServer: number): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.put(dns + "compteServer/" + idCompteServer + "/newInterval", null, options);
  }

  getBoitierOfAccount(keyWord: string, id: number, page: number, size: number): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.get(dns + "compteServer/" + id + "/Boitiers?&keyWord=" + keyWord + "&page=" + page + "&size=" + size, options);
  }

  getCompteServerById(id: number): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.get(dns + "compteServer/" + id, options);
  }

  getServerAccountById(id: number): Observable<any> {
    let options = { headers: this.getHeaders() };
    return this._http.get(dns + "compteServerWeb/" + id, options);
  }


  getCurrentUserName(): any {
    try {
      var decode = jwt_decode(localStorage.getItem("token"));
      return decode.sub;
    } catch (Error) {
      return null;
    }
  }
}
