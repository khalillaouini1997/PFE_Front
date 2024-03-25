import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import {CompteWeb, Option, PathConfigPayload} from '../data/data';
import { dns } from '../global.config';
import {DataService} from "./data.service";


@Injectable({
  providedIn: 'root'
})
export class CompteWebService {
  constructor(private http: HttpClient, private dataService: DataService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? token : ''
    });
    return headers;
  }

  getCurrentUserName(): string | null {
    try {
      const decode = jwtDecode(localStorage.getItem("token") ?? ''); // Handle potential null token
      return decode.sub ?? null; // Return null if decode.sub is undefined
    } catch (error) {
      return null;
    }
  }


  addCompteWeb(compteWeb: CompteWeb): Observable<any> {
    return this.http.post(`${dns}compteWeb?userName=${this.getCurrentUserName()}`, compteWeb, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getDateLog(username: string): Observable<any> {
    return this.http.get(`${dns}compteWeb?datelog=${username}`, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getAllWebAccountByKeyWord(keyWord: string, page: number, size: number): Observable<any> {
    return this.http.get(`${dns}compteWeb?keyWord=${keyWord}&page=${page}&size=${size}&userName=${this.getCurrentUserName()}`, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getWebAccountById(id: number): Observable<any> {
    return this.http.get(`${dns}compteWeb/${id}?userName=${this.getCurrentUserName()}`, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  editPathConfig(idServer: number, pathConfigPayload: PathConfigPayload): Observable<any> {
    return this.http.post<any>(dns + "boities/editPathConfig/" + idServer, pathConfigPayload, { headers: this.getHeaders() });
  }



  associateCompteWebToCompteServer(idWeb: number, idServer: number): Observable<any> {
    return this.http.put(`${dns}compteWeb/${idWeb}/compteServer/${idServer}`, null, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  updateWebAccount(idCompteWeb: number, newCompteWeb: CompteWeb): Observable<any> {
    return this.http.put(`${dns}compteWeb/${idCompteWeb}`, newCompteWeb, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  deleteWebAccount(id: number): Observable<any> {
    return this.http.delete(`${dns}compteWeb/${id}`, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getAllAdminComptesByKeyWord(keyWord: string, page: number, size: number): Observable<any> {
    if (this.dataService.isAgentAdmin()) {
      return this.http.get(`${dns}adminCompteWeb/all?keyWord=${keyWord}&page=${page}&size=${size}`, { headers: this.getHeaders() }).pipe(
        map((res: any) => res),
        catchError((error: any) => throwError(error))
      );
    }
    return throwError('Unauthorized'); // Handle unauthorized access
  }

  addOptionsToWebAccount(id: number, options: Option[]): Observable<any> {
    return this.http.post(`${dns}compteWeb/${id}/Options`, options, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }
}
