import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AdministratorCompte, CompteWeb, Option, PathConfigPayload, Tram } from '../data/data';
import { environment } from '../../environments/environment';
import { DataService } from "./data.service";


@Injectable({
  providedIn: 'root'
})
export class CompteWebService {

  currentUser: AdministratorCompte;

  constructor(private _http: HttpClient, private dataService: DataService) { }



  addCompteWeb(compteWeb: CompteWeb): Observable<any> {

    return this._http.post<any>(`${environment.apiBaseUrl}compteWeb?userName=${this.dataService.getCurrentUserName()}`, compteWeb);
  }


  getDateLog(username: string): Observable<any> {
    return this._http.get(`${environment.apiBaseUrl}compteWeb?datelog=${username}`).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getAllWebAccountByKeyWord(keyWord: string, page: number, size: number): Observable<any> {
    return this._http.get(`${environment.apiBaseUrl}compteWeb?keyWord=${keyWord}&page=${page}&size=${size}&userName=${this.dataService.getCurrentUserName()}`).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getWebAccountById(id: number): Observable<any> {
    return this._http.get(`${environment.apiBaseUrl}compteWeb/${id}?userName=${this.dataService.getCurrentUserName()}`).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  editPathConfig(idServer: number, pathConfigPayload: PathConfigPayload): Observable<any> {

    return this._http.post<any>(`${environment.apiBaseUrl}boities/editPathConfig/${idServer}`, pathConfigPayload);
  }

  associateCompteWebToCompteServer(idWeb: number, idServer: number): Observable<any> {
    return this._http.put(`${environment.apiBaseUrl}compteWeb/${idWeb}/compteServer/${idServer}`, null).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  updateWebAccount(idCompteWeb: number, newCompteWeb: CompteWeb): Observable<any> {
    return this._http.put(`${environment.apiBaseUrl}compteWeb/${idCompteWeb}`, newCompteWeb).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getAllCompteClientWeb(): Observable<any> {

    return this._http.get(`${environment.apiBaseUrl}compteWeb/All?userName=${this.dataService.getCurrentUserName()}`);
  }


  getAllLastTram(idCompteWeb: number): Observable<any> {

    return this._http.get(`${environment.apiBaseUrl}compteWeb/${idCompteWeb}/lastTrame`);
  }

  exportLastTram(realtimes: Tram[]): Observable<any> {

    return this._http.post(`${environment.apiBaseUrl}compteWeb/lastTrame/export`, realtimes);
  }

  getAllLastTramforAllClient(): Observable<any> {

    return this._http.get(`${environment.apiBaseUrl}compteWeb/AllLastTram`);
  }


  deleteWebAccount(id: number): Observable<any> {
    return this._http.delete(`${environment.apiBaseUrl}compteWeb/${id}`).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error))
    );
  }

  getAllAdminComptesByKeyWord(keyWord: string, page: number, size: number): Observable<any> {
    if (this.dataService.isAgentAdmin()) {
      return this._http.get(`${environment.apiBaseUrl}adminCompteWeb/all?keyWord=${keyWord}&page=${page}&size=${size}`).pipe(
        map((res: any) => res),
        catchError((error: any) => throwError(error))
      );
    }
    return throwError('Unauthorized'); // Handle unauthorized access
  }

  addOptionsToWebAccount(id: number, options: Option[]) {
    this._http.post(environment.apiBaseUrl + "compteWeb/" + id + "/Options", options)
      .subscribe({
        next: (response: any) => {
          console.log(response);
        },
        error: (error: any) => {
          console.error("Error adding options:", error);
          // Handle errors appropriately
        }
      });
  }

}
