import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {AdministratorCompte, CompteWeb, Option, PathConfigPayload, Tram} from '../data/data';
import {dns} from '../global.config';
import {DataService} from "./data.service";
import {createAuthorizationHeader} from "../utils/security/headers";


@Injectable({
  providedIn: 'root'
})
export class CompteWebService {

  currentUser: AdministratorCompte;

  constructor(private _http: HttpClient, private dataService: DataService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? token : ''
    });
  }


  addCompteWeb(compteWeb: CompteWeb): Observable<any> {
    const headers = this.getHeaders();
    return this._http.post<any>(`${dns}compteWeb?userName=${this.dataService.getCurrentUserName()}`, compteWeb, { headers });
  }


  getDateLog(username: string): Observable<any> {
    return this._http.get(`${dns}compteWeb?datelog=${username}`, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getAllWebAccountByKeyWord(keyWord: string, page: number, size: number): Observable<any> {
    return this._http.get(`${dns}compteWeb?keyWord=${keyWord}&page=${page}&size=${size}&userName=${this.dataService.getCurrentUserName()}`, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getWebAccountById(id: number): Observable<any> {
    return this._http.get(`${dns}compteWeb/${id}?userName=${this.dataService.getCurrentUserName()}`, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  editPathConfig(idServer: number, pathConfigPayload: PathConfigPayload): Observable<any> {
    const headers = this.getHeaders();
    return this._http.post<any>(`${dns}boities/editPathConfig/${idServer}`, pathConfigPayload, { headers });
  }

  /*associateCompteWebToCompteServer(idWeb: number, idServer: number): Observable<any> {
    return this._http.put(`${dns}compteWeb/${idWeb}/compteServer/${idServer}`, null, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }*/

  updateWebAccount(idCompteWeb: number, newCompteWeb: CompteWeb): Observable<any> {
    return this._http.put(`${dns}compteWeb/${idCompteWeb}`, newCompteWeb, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getAllCompteClientWeb(): Observable<any> {
    const headers = createAuthorizationHeader();
    return this._http.get(`${dns}compteWeb/All?userName=${this.dataService.getCurrentUserName()}`, { headers });
  }


  getAllLastTram(idCompteWeb: number): Observable<any> {
    const headers = createAuthorizationHeader();
    return this._http.get(`${dns}compteWeb/${idCompteWeb}/lastTrame`, { headers });
  }

  exportLastTram(realtimes: Tram[]): Observable<any> {
    const headers = createAuthorizationHeader();
    return this._http.post(`${dns}compteWeb/lastTrame/export`, realtimes, { headers });
  }

  getAllLastTramforAllClient(): Observable<any> {
    const headers = createAuthorizationHeader();
    return this._http.get(`${dns}compteWeb/AllLastTram`, { headers });
  }


  deleteWebAccount(id: number): Observable<any> {
    return this._http.delete(`${dns}compteWeb/${id}`, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getAllAdminComptesByKeyWord(keyWord: string, page: number, size: number): Observable<any> {
    if (this.dataService.isAgentAdmin()) {
      return this._http.get(`${dns}adminCompteWeb/all?keyWord=${keyWord}&page=${page}&size=${size}`, { headers: this.getHeaders() }).pipe(
        map((res: any) => res),
        catchError((error: any) => throwError(error))
      );
    }
    return throwError('Unauthorized'); // Handle unauthorized access
  }

  addOptionsToWebAccount(id: number, options: Option[]): Observable<any> {
    return this._http.post(`${dns}compteWeb/${id}/Options`, options, { headers: this.getHeaders() }).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }
}
