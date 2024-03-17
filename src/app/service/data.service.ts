import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { dns } from '../global.config';
import { createAuthorizationHeader } from '../utils/security/headers';
import { HttpClient } from '@angular/common/http';
import { AdministratorCompte, Tram } from '../data/data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  currentUser: AdministratorCompte;
  constructor(private _http: HttpClient) { }

  getAllCompteClientWeb(): Observable<any> {
    let headers = createAuthorizationHeader();
    return this._http.get(dns + "compteWeb/All?userName=" + this.currentUser.username, { headers: headers });
  }

  getAllLastTram(idCompteWeb: number): Observable<any> {
    let headers = createAuthorizationHeader();
    return this._http.get(dns + "compteWeb/" + idCompteWeb + "/lastTrame", { headers: headers });
  }

  exportLastTram(realtimes: Tram[]): Observable<any> {
    let headers = createAuthorizationHeader();
    return this._http.post(dns + 'compteWeb/lastTrame/export', realtimes, { headers: headers });
  }
}
