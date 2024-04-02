import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { dns } from '../global.config';
import { createAuthorizationHeader } from '../utils/security/headers';
import { AdministratorCompte } from '../data/data';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TraccarService {
  public currentUser :AdministratorCompte;

  constructor(private _http: HttpClient) {

  }

  loadToken() {
    return localStorage.getItem("token");
  }

  getLisTraccar(): Observable<any> {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    let headers = createAuthorizationHeader();
    const url = `${dns}traccar/${this.currentUser.idTraccar}`;
    return this._http.get(url, { headers });
  }

}
